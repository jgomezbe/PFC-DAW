import csv
import os
import subprocess
from datetime import datetime
import pandas as pd
from django_cron import CronJobBase, Schedule
from .models import Log, Player


class ScriptCronJob(CronJobBase):
    RUN_EVERY_MINS = 60*24*7
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'api.script_cron_job'

    def do(self):
        script_path_players = os.path.join(os.path.dirname(
            os.path.abspath(__file__)), 'scripts', 'players.py')
        script_path_scraper = os.path.join(os.path.dirname(
            os.path.abspath(__file__)), 'scripts', 'scraper.py')
        """  try:
            subprocess.run(['python', script_path_players], check=True)
            players_log_file = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), 'data', 'players_log.txt')
            with open(players_log_file, 'r')as file:
                current_players_log = file.read()
            previous_players_log = Log.objects.filter(
                script='players').order_by('-date').first()
            if previous_players_log is not None and previous_players_log.changes_detected != current_players_log:
                changes_detected_players = current_players_log
            else:
                changes_detected_players = 'No se encontraron cambios detectados en players.py'
            log_players = Log(
                script='players', changes_detected=changes_detected_players, date=datetime.now())
            log_players.save()
        except (subprocess.CalledProcessError, FileNotFoundError)as e:
            print(f"Error al ejecutar el script players.py: {str(e)}")
        """
        try:

            subprocess.run(['python', script_path_scraper],
                        check=True, timeout=400000)
            csv_file_path = os.path.join(os.path.dirname(
                os.path.abspath(__file__)), 'data', 'cantera.csv')

            if os.path.isfile(csv_file_path):
                with open(csv_file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[1:]
                    for line in lines:
                        data = line.strip().split(',')
                        print(data)
                        jugador = Player(
                            nombre=data[0],
                            enlace=data[1],
                            temporada=data[2],
                            fecha=data[3],
                            ultimo_club=data[4],
                            nuevo_club=data[5],
                            valor_mercado=data[6],
                            coste=data[7]
                        )
                        jugador.save()

                os.remove(csv_file_path)
                log_file_path = os.path.join(os.path.dirname(
                    os.path.abspath(__file__)), 'data', 'players_log.txt')
                if os.path.isfile(log_file_path):
                    os.remove(log_file_path)

                log_players = Log(
                    script='players', changes_detected='CSV imported', date=datetime.now())
                log_players.save()

            else:
                print('CSV file not found.')
        except subprocess.CalledProcessError as e:
            print(f"Error al ejecutar el script scraper.py: {str(e)}") 
