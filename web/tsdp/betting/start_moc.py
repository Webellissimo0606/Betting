from subprocess import Popen, PIPE, check_output, STDOUT
import datetime
import shutil


def run_checksystems():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    shutil.copy('/ml-tsdp/suztoolz/check_systems_live_func.py', '/ml-tsdp/check_systems_live_func.py')
    with open('/logs/checksystems_live_' + fulltimestamp + '.txt', 'w') as f:
        with open('/logs/checksystems_live_error_'+fulltimestamp+'.txt', 'w') as e:
            print('processing Check Systems...')
            proc = Popen(['/anaconda2/python', '/ml-tsdp/check_systems_live_ib.py','1','1','1','0'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()
            f.flush()
            e.flush()
            proc = Popen(['/anaconda2/python', '/ml-tsdp/check_systems_live_func.py','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            #proc.wait()
            

def get_newtimetable():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    with open('/logs/get_timetable_' + fulltimestamp + '.txt', 'w') as f:
        with open('/logs/get_timetable_error_'+fulltimestamp+'.txt', 'w') as e:
            #f.flush()
            #e.flush()
            print('Attempting to get new timetable...')
            proc = Popen(['/anaconda2/python', '/ml-tsdp/moc_live.py','0','0','0','0'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            #proc.wait()
            
def run_vol_adjsize():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    with open('/logs/update_custom_signals_' + fulltimestamp + '.txt', 'w') as f:
        with open('/logs/update_custom_signals_error_'+fulltimestamp+'.txt', 'w') as e:
            print('processing custom signal update...')
            proc = Popen(['/anaconda2/python', '/ml-tsdp/vol_adjsize.py','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()
            f.flush()
            e.flush()
            proc = Popen(['/anaconda2/python', '/ml-tsdp/suztoolz/vol_adjsize_moclive_func.py','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()
            
def update_chartdb():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    with open('/logs/update_chartdb_' + fulltimestamp + '.txt', 'w') as f:
        with open('/logs/update_chartdb_error_'+fulltimestamp+'.txt', 'w') as e:
            print('processing chartdb update...')
            proc = Popen(['/anaconda2/python', '/ml-tsdp/create_board_history.py','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()
            f.flush()
            e.flush()
            proc = Popen(['/anaconda2/python', '/ml-tsdp/excel_charts.py','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()

def restart_webserver():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    with open('/logs/restart_webserver_' + fulltimestamp + '.txt', 'w') as e:
        with open('/logs/restart_webserver_error_'+fulltimestamp+'.txt', 'w') as f:
            print('restarting webserver...')
            proc = Popen(['/ml-tsdp/web/tsdp/start_webserver.bat'],\
                         cwd='/ml-tsdp/web/tsdp/',stdout=f, stderr=e)

if __name__ == "__main__":
    get_newtimetable()
    restart_webserver()