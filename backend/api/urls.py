from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = (
    [
        path("register/", views.RegisterView.as_view(), name="register"),
        path("login/", views.LoginView.as_view(), name="login"),
        path("logout/", views.LogoutView.as_view(), name="logout"),
        path("profile/<str:username>/", views.ProfileView.as_view(), name="profile"),
        path(
            "change-password/",
            views.ChangePasswordView.as_view(),
            name="change-password",
        ),
        path('logs/', views.AdminPanelView.as_view(), name='admin-panel-logs'),

        path(
            "approval-request/",
            views.ApprovalRequestView.as_view(),
            name="approval-request",
        ),
        path(
            "user-management/",
            views.UserManagementView.as_view(),
            name="user-management",
        ),
        path("current-user/", views.CurrentUserView.as_view(),
             name="current-user"),
    ]

)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
