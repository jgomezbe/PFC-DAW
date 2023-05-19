from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class Player(models.Model):
    nombre = models.CharField(max_length=100)
    enlace = models.URLField()
    temporada = models.CharField(max_length=10)
    fecha = models.CharField(max_length=20)
    ultimo_club = models.CharField(max_length=100)
    nuevo_club = models.CharField(max_length=100)
    valor_mercado = models.CharField(max_length=20)
    coste = models.CharField(max_length=20)

    def __str__(self):
        return self.nombre


class Profile(models.Model):
    user = models.OneToOneField(
        "auth.User", on_delete=models.CASCADE, related_name="profile"
    )
    photo = models.ImageField(
        upload_to="profile_photos",
        blank=True,
        null=True,
        default="default.png",
    )
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=9, blank=True)
    aprobado = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


class ApprovalRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    nombre = models.CharField(max_length=255)
    apellidos = models.CharField(max_length=255)
    mensaje = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-fecha_creacion"]

    def __str__(self):
        return f"Solicitud de aprobación de {self.nombre} {self.apellidos}"


class Log(models.Model):
    SCRIPT_CHOICES = (
        ('players', 'Players'),
        ('scraper', 'Scraper'),
    )

    date = models.DateTimeField(auto_now_add=True)
    script = models.CharField(max_length=50, choices=SCRIPT_CHOICES)
    changes_detected = models.TextField()

    def __str__(self):
        return f'{self.script} - {self.date}'