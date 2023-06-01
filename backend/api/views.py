from .serializers import TransferListSerializer, TransferSerializer
from django.db.models import Max, Q
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils.timezone import timedelta
from datetime import datetime
from ProyectoCanteraAPIReact import settings
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib import messages
from django.core.signing import Signer
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.storage import default_storage
from unidecode import unidecode
from django.http import Http404
from rest_framework import status
import hashlib
import os
from django.contrib.auth import authenticate, login, logout
from .serializers import ChangePasswordSerializer, ProfileSerializer, RegisterSerializer, ApprovalRequestSerializer, TransferListSerializer
from .models import ApprovalRequest, Log, ApprovalRequest, Transfer, Profile, TransferList


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Crea un nuevo usuario y perfil asociado
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
    def post(self, request):
        # Cierra la sesión del usuario y elimina la cookie de autenticación
        logout(request)
        response = Response({'success': 'Sesión cerrada exitosamente.'})
        response.delete_cookie('authtoken')
        return response


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
            return Response({'id': user.id, 'is_authenticated': is_authenticated, 'is_approved': is_approved, 'username': username, 'profile': profile_data, 'email': email, 'is_admin': is_admin, 'first_name': first_name, 'last_name': last_name})
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
                if password_actual == new_password:
                    return Response({'detail': 'La nueva contraseña debe ser diferente a la contraseña actual'}, status=status.HTTP_400_BAD_REQUEST)
                elif new_password != serializer.validated_data['confirmNewPassword']:
                    return Response({'detail': 'La nueva contraseña y su confirmación no coinciden'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    user.set_password(new_password)
                    user.save()
                    messages.success(
                        request, 'La contraseña ha sido cambiada exitosamente')
                    return Response({'detail': 'Contraseña cambiada exitosamente'}, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'La contraseña actual es incorrecta'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApprovalRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.is_superuser:  # Verificar si el usuario es un superusuario
            approval_requests = ApprovalRequest.objects.all()
        else:
            approval_requests = ApprovalRequest.objects.filter(user=user)

        serializer = ApprovalRequestSerializer(approval_requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ApprovalRequestSerializer(data=request.data)
        if serializer.is_valid():
            # Asegúrate de pasar el valor correcto para user_id
            serializer.save(user_id=request.data['user_id'])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminPanelView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        script = request.GET.get('script')
        query = Q()
        if script == 'players':
            query &= Q(script='players')
        elif script == 'scraper':
            query &= Q(script='scraper')
        logs = Log.objects.filter(query)
        logs_data = {'logs': [{'date': log.date.strftime(
            '%Y-%m-%d %H:%M:%S'), 'changes_detected': log.changes_detected, 'script': script}for log in logs]}
        return Response(logs_data)


class UserManagementView(APIView):
    def post(self, request, user_id):
        try:
            approval_request = ApprovalRequest.objects.get(id=user_id)
            user_id = approval_request.user_id

            profile = Profile.objects.get(user_id=user_id)
            profile.aprobado = True
            profile.save()

            approval_request.delete()

            return Response({'message': 'Usuario aprobado y solicitud eliminada'}, status=status.HTTP_200_OK)
        except (ApprovalRequest.DoesNotExist, Profile.DoesNotExist):
            return Response({'error': 'Solicitud o perfil no encontrados'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, user_id):
        try:
            approval_request = ApprovalRequest.objects.get(id=user_id)
            approval_request.delete()
            return Response({'message': 'Petición rechazada'}, status=status.HTTP_200_OK)
        except ApprovalRequest.DoesNotExist:
            return Response({'error': 'Petición no encontrada'}, status=status.HTTP_404_NOT_FOUND)


class PlayerSearchView(APIView):
    def get(self, request):
        transfers_in_db = Transfer.objects.all()
        if transfers_in_db.exists():
            six_weeks_ago = datetime.now() - timedelta(weeks=6)
            try:
                last_log_date = Log.objects.filter(
                    script='scraper').aggregate(Max('date'))['date__max']
                if last_log_date is not None and last_log_date.date() < six_weeks_ago.date():
                    return Response({'message': 'La base de datos de jugadores no se ha actualizado en más de 6 semanas. Por favor, contacte con el administrador.'}, status=status.HTTP_404_NOT_FOUND)
                else:
                    return Response({'message': 'Hay jugadores en la base de datos y se han actualizado en las últimas 6 semanas.'}, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({'message': 'Error al obtener la fecha del último log del script scraper.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({'message': 'No se encontraron jugadores en la base de datos. Por favor, contacte con el administrador.'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request):
        # Obtiene el nombre del jugador del cuerpo de la solicitud
        nombre_jugador = request.data.get('nombre')
        if nombre_jugador:
            # Convierte el nombre del jugador a ASCII
            nombre_jugador_ascii = unidecode(nombre_jugador)
            # Filtra las transferencias por coincidencia en el nombre o en el nombre ASCII
            transfers = Transfer.objects.filter(
                Q(nombre__icontains=nombre_jugador) | Q(nombre__icontains=nombre_jugador_ascii))
            if not transfers:  # Comprueba si no hay transferencias que coincidan
                # Devuelve un mensaje indicando que no se encontraron jugadores con ese nombre
                return Response({'message': 'No se encontraron jugadores con ese nombre.'}, status=status.HTTP_404_NOT_FOUND)
            else:
                # Serializa las transferencias encontradas
                serialized_transfers = list(transfers.values())
                # Devuelve las transferencias serializadas en la respuesta
                return Response({'jugadores': serialized_transfers}, status=status.HTTP_200_OK)
        else:
            # Devuelve un mensaje indicando que no se teclearon jugadores
            return Response({'message': 'No se ha tecleado ningún nombre, por favor inserte un nombre.'}, status=status.HTTP_404_NOT_FOUND)


class PlayerTransfersView(APIView):
    def get(self, request, nombre):
        # Elimina los espacios en blanco alrededor del nombre del jugador
        nombre_jugador = nombre.strip()
        # Convierte el nombre del jugador a ASCII
        nombre_jugador_ascii = unidecode(nombre_jugador)

        if nombre_jugador:
            transfers = Transfer.objects.filter(
                Q(nombre__icontains=nombre_jugador) |
                Q(nombre__icontains=nombre_jugador_ascii)
            )  # Filtra las transferencias por coincidencia en el nombre o en el nombre ASCII
        else:
            transfers = Transfer.objects.all()  # Obtiene todas las transferencias

        if transfers.exists():
            # Serializa las transferencias encontradas
            serialized_transfers = list(transfers.values())
            # Devuelve las transferencias serializadas en la respuesta
            return Response({'transfers': serialized_transfers}, status=status.HTTP_200_OK)
        else:
            # Lanza una excepción Http404 si no se encontraron transferencias para este jugador
            raise Http404('No se encontraron transfers para este jugador.')


class TransferListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transfer_lists = TransferList.objects.all()
        data = []
        for transfer_list in transfer_lists:
            serialized_data = TransferListSerializer(transfer_list).data
            owner_id = transfer_list.user_id
            owner_username = User.objects.get(id=owner_id).username
            serialized_data['username'] = owner_username
            data.append(serialized_data)
        return Response(data)

    def post(self, request, id=None):
        if not id:
            # Crear una nueva lista
            serializer = TransferListSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user_id=request.data['user_id'])
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Agregar un transfer a una lista existente
            try:
                transfer_list = TransferList.objects.get(id=id)
                # Suponiendo que tienes un campo 'transfer_id' en los datos de la solicitud
                print(request.data)
                transfer_id = request.data.get('transfer').get('id')

                try:
                    transfer = Transfer.objects.get(id=transfer_id)
                    transfer_list.transfers.add(transfer)
                    serializer = TransferListSerializer(transfer_list)
                    return Response(serializer.data)
                except Transfer.DoesNotExist:
                    return Response({"error": "El objeto de transferencia no existe."}, status=status.HTTP_400_BAD_REQUEST)

            except TransferList.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, id):
        try:
            transfer_list = TransferList.objects.get(id=id)
            transfer_list.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TransferList.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
