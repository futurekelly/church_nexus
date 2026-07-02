#!/bin/sh
echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn server..."
gunicorn church_nexus.wsgi:application --bind 0.0.0.0:10000 --workers 2 --timeout 600
