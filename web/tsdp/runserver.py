from subprocess import Popen, PIPE, check_output, STDOUT
import datetime
fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')

with open('/logs/runserver_' + fulltimestamp + '.txt', 'w') as e:
	with open('/logs/runserver_error_'+fulltimestamp+'.txt', 'w') as f:
	    #f.flush()
	    #e.flush()
	    proc = Popen(['python', 'manage.py','runserver','0.0.0.0:80','--noreload'], stdout=f, stderr=e)
	    #proc = Popen(['python', 'manage.py','runserver','0.0.0.0:80'], stderr=e)
	    #proc.wait()
    