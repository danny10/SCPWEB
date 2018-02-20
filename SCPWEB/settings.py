"""
Django settings for SCPWEB project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'o%$hvt8bk&1jp(alusfx480@(%ih5^%)4gn9o(y6@((%-a^uhd'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = ['*']

TEMPLATE_DIRS = (os.path.join(BASE_DIR, 'templates'),)

# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'rest_framework',
    'simple_history', 
    'apoyo',
    'capitulo',
    'circuito',
    'contratista',
    'poligono',
    'provincia',
    'sector',
    'sucursal',
    'usuario',
    'lote',
    'inspeccion',
    
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
)


FILE_UPLOAD_HANDLERS = [
"django.core.files.uploadhandler.MemoryFileUploadHandler",
"django.core.files.uploadhandler.TemporaryFileUploadHandler",
]

ROOT_URLCONF = 'SCPWEB.urls'

WSGI_APPLICATION = 'SCPWEB.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    # 'default': {
    #     'ENGINE': 'django.db.backends.sqlite3',
    #     'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    # }

     'default': {
        'NAME': 'scp_db',
        'ENGINE': 'sqlserver_ado',
        'HOST': 'LAPTOP-19M6PSLQ\SQLEXPRESS01',
        'USER': 'conecta_sinin',
        'PASSWORD': 'santi10',
        'OPTIONS' : {
            'provider': 'SQLNCLI11',
        }        
    }
}


TEMPLATES = [
    {
        #'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            'templates'
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS as TCP

TEMPLATE_CONTEXT_PROCESSORS = TCP + (
    'django.core.context_processors.request',
)

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'es-co'

TIME_ZONE = 'America/Bogota'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

#STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

MEDIA_ROOT = os.sep.join(os.path.abspath(__file__).split(os.sep)[:-2] + ['media'])
# MEDIA_URL = '/media/'


REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions,
    # or allow read-only access for unauthenticated users.
     # 'DEFAULT_PERMISSION_CLASSES': [
     #     'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly'
     # ],   
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'PAGE_SIZE': 10,    
    #'DEFAULT_FILTER_BACKENDS': ('rest_framework.filters.DjangoFilterBackend',),
}

LOG_ERROR = BASE_DIR + '\logError.txt'
AWS_STORAGE_BUCKET_NAME = 'source-scp'

AWS_S3_CUSTOM_DOMAIN = '%s.s3.amazonaws.com' % AWS_STORAGE_BUCKET_NAME

MEDIAFILES_LOCATION = 'media'
MEDIA_URL = "https://%s/%s/" % (AWS_S3_CUSTOM_DOMAIN, MEDIAFILES_LOCATION)
DEFAULT_FILE_STORAGE = 'custom_storages.MediaStorage'