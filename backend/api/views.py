from .models import User
from django.db.models import Q
from .serializers import RegisterSerializer, ProfileSerializer
from django.core.files.storage import default_storage
import hashlib
import os
from django.core.exceptions import ObjectDoesNotExist
from django.core.signing import Signer
from django.contrib import messages
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework.response import Response
from ProyectoCanteraAPIReact import settings
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .serializers import ProfileSerializer
from .models import Log
from .models import ApprovalRequest
from .serializers import ApprovalRequestSerializer
from django.contrib.auth import authenticate, login, logout
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import ApprovalRequest, Profile
from .serializers import ChangePasswordSerializer, ProfileSerializer, RegisterSerializer, ApprovalRequestSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            Profile.objects.create(user=user)
            login(request, user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response({'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            signer = Signer()
            authtoken = hashlib.sha256(signer.sign(
                f"{username}:{password}").encode('utf-8')).hexdigest()
            response = Response({'detail': 'Inicio de sesión exitoso'})
            response.set_cookie('authtoken', authtoken, max_age=86400,
                                secure=True, httponly=True, samesite='Strict', path='/')
            return response
        else:
            return Response({'detail': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request): logout(request); response = Response(
        {'success': 'Sesión cerrada exitosamente.'}); response.delete_cookie('authtoken'); return response


class CurrentUserView(APIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            is_authenticated = True
            username = user.username
            first_name = user.first_name
            last_name = user.last_name
            email = user.email
            is_admin = user.is_superuser
            try:
                profile = user.profile
                is_approved = profile.aprobado
                profile_serializer = ProfileSerializer(profile)
                profile_data = profile_serializer.data
            except ObjectDoesNotExist:
                profile_data = None
            return Response({'is_authenticated': is_authenticated, 'is_approved': is_approved, 'username': username, 'profile': profile_data, 'email': email, 'is_admin': is_admin, 'first_name': first_name, 'last_name': last_name})
        else:
            is_authenticated = False
            return Response({'detail': 'Usuario no autenticado'}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        if user.profile.aprobado == 0:
            return Response({'mensaje': 'Tu cuenta está pendiente de verificación por el administrador'}, status=status.HTTP_403_FORBIDDEN)
        if request.user != user:
            return Response('No está autorizado para ver este perfil.', status=status.HTTP_403_FORBIDDEN)
        serializer = ProfileSerializer(user.profile)
        context = serializer.data
        if not user.profile.photo:
            context['default'] = settings.MEDIA_URL+'default.png'
        return Response(context)

    def put(self, request, username):
        user = get_object_or_404(User, username=username)
        if request.user != user:
            return Response('No está autorizado para editar este perfil.', status=status.HTTP_403_FORBIDDEN)
        perfil = user.profile
        perfil_form = ProfileSerializer(
            instance=perfil, data=request.data, partial=True)
        if perfil_form.is_valid():
            if 'photo'not in request.data:
                perfil_form.validated_data['photo'] = perfil.photo
            else:
                if perfil.photo and perfil.photo.name != 'default.png':
                    default_storage.delete(perfil.photo.name)
                username = user.username
                extension = os.path.splitext(request.data['photo'].name)[1]
                new_file_path = f"profile_photos/{username}_profile_pic{extension}"
                file = request.data['photo']
                perfil_form.validated_data['photo'] = default_storage.save(
                    new_file_path, file)
            perfil = perfil_form.save()
            messages.success(
                request, 'Se han guardado los cambios en el perfil')
            serializer = ProfileSerializer(perfil)
            context = serializer.data
            if not perfil.photo:
                context['default'] = settings.MEDIA_URL+'default.png'
            return Response(context)
        else:
            print(perfil_form.errors)
            return Response(perfil_form.errors, status=status.HTTP_400_BAD_REQUEST)


class IndexView(APIView):
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            if not user.profile.aprobado:
                if user.is_staff:
                    messages.warning(
                        request, 'Su cuenta aún no ha sido aprobada por el administrador.')
                else:
                    return Response({'detail': 'Cuenta no aprobada'}, status=403)
        return Response({'detail': 'Bienvenido al índice'}, status=200)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            password_actual = serializer.validated_data['oldPassword']
            new_password = serializer.validated_data['newPassword']
            user = request.user
            if user.check_password(password_actual):
                user.set_password(new_password)
                user.save()
                messages.success(
                    request, 'La contraseña ha sido cambiada exitosamente')
                return Response({'detail': 'Contraseña cambiada exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'La contraseña actual es incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApprovalRequestView(APIView):
    def get(self, request):
        user = request.user
        try:
            solicitud_existente = ApprovalRequest.objects.get(user=user)
            serializer = ApprovalRequestSerializer(solicitud_existente)
            message = 'Ya has enviado una solicitud de verificación.'
            return Response({'message': message, 'data': serializer.data}, status=status.HTTP_200_OK)
        except ApprovalRequest.DoesNotExist:
            return Response({'message': 'No se encontró ninguna solicitud de verificación existente.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        user = request.user
        serializer = ApprovalRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPanelView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, script=None):
        query = Q()  # Query vacía
        if script == 'players':
            query = Q(script='players')
        elif script == 'scrape':
            query = Q(script='scrape')

        logs = Log.objects.filter(query)
        logs_data = {
            'logs': [
                {
                    'date': log.date.strftime('%Y-%m-%d %H:%M:%S'),
                    'changes_detected': log.changes_detected,
                    'script': log.script
                }
                for log in logs
            ]
        }

        return Response(logs_data)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, ApprovalRequest


class UserManagementView(APIView):
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            profile = Profile.objects.get(id=user_id)
            approval_request = ApprovalRequest.objects.get(user=user)
            profile.is_approved = True
            approval_request.save()
            return Response({'message': 'User approved'}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, ApprovalRequest.DoesNotExist):
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, user_id):
        try:
            approval_request = ApprovalRequest.objects.get(user_id=user_id)
            approval_request.delete()
            return Response({'message': 'Request rejected'}, status=status.HTTP_200_OK)
        except ApprovalRequest.DoesNotExist:
            return Response({'error': 'Request not found'}, status=status.HTTP_404_NOT_FOUND)

