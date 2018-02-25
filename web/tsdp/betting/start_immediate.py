from subprocess import Popen, PIPE, check_output, STDOUT
from .models import UserSelection
from .helpers import getTimeStamp, MCdate
import json
import datetime

def start_immediate():
    fulltimestamp=datetime.datetime.now().strftime('%Y%m%d_%H-%M-%S')
    with open('\logs\moc_live_immediate_' + fulltimestamp + '.txt', 'w') as f:
        with open('\logs\moc_live_immediate_error_'+fulltimestamp+'.txt', 'w') as e:
            #f.flush()
            #e.flush()
            proc = Popen(['/anaconda2/python', '/ml-tsdp/moc_live.py','1','1','1','1'],\
                         cwd='/ml-tsdp/',stdout=f, stderr=e)
            proc.wait()
            print('immediate orders processing...')

    lastSelection = UserSelection.objects.all().order_by('-timestamp').first()
    #lastMCdate = int(lastSelection.mcdate)
    mcdate = int(MCdate())
    #if lastMCdate<mcdate:
    updated_selection=json.dumps({key: [order[0], "False"] for key, order in eval(lastSelection.selection).items()})
    record = UserSelection(userID=lastSelection.userID, selection=updated_selection, \
                           v4futures=lastSelection.v4futures, v4mini=lastSelection.v4mini, \
                           v4micro=lastSelection.v4micro, mcdate=mcdate, timestamp=getTimeStamp())
    record.save()
