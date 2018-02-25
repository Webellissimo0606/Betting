from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from .models import UserSelection
from .helpers import *
from .start_immediate import start_immediate
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from django.views.static import serve
import pandas as pd
import sqlite3
import json
import os
from os.path import isfile, join
#dbPath = '/tsdpWEB/tsdp/db.sqlite3'
#readConn = sqlite3.connect(dbPath)

def downloaddb(request):
    filepath = '/ml-tsdp/data/futures.sqlite3'
    return serve(request, os.path.basename(filepath), os.path.dirname(filepath))

# Create your views here.
#def refreshMetaData(request):
#    updateMeta = MetaData(mcdate=MCdate(), timestamp=getTimeStamp())
#    updateMeta.save()

def addrecord(request):
    #accountinfo = json.loads(request.POST.get('accountinfo'))
    #custom_signals = json.loads(request.POST.get('custom_signals'))
    list_boxstyles = json.loads(request.POST.get('boxstyles'))
    
    if list_boxstyles != []:
        cloc= json.loads(request.POST.get("componentloc"))
        print cloc
        ##create new boxstyles json
        votingComponents=get_blends(cloc, list_boxstyles=list_boxstyles)
    else:
        cloc = eval(UserSelection.objects.order_by('-timestamp').first().dic()['componentloc'])
        print cloc
        votingComponents=get_blends(cloc)

    record = UserSelection(userID=request.POST.get('user_id', 32), selection=request.POST.get("Selection"), \
                            v4futures=json.dumps(votingComponents), v4mini=json.dumps(votingComponents), \
                            v4micro=json.dumps(votingComponents),
                            componentloc = json.dumps(cloc),
                            #boxstyles = json_boxstyles,
                            #performance = json_performance,
                            mcdate=MCdate(), timestamp=getTimeStamp())
    record.save()
    if list_boxstyles != []:
        recreateCharts()
    '''
    if accountinfo != {}:
        recreateCharts(accountinfo=accountinfo)

    if custom_signals != {}:
        recreateCharts(custom_signals=custom_signals)
    '''
    selections = UserSelection.objects.all().order_by('-timestamp')
    # Please wait up to five minutes for immediate orders to be processed.
    if 'True' in [order[1] for sys, order in eval(selections[0].selection).items()]:
        print('Immediate Orders found')
        #start_immediate()

    recent = UserSelection.objects.order_by('-timestamp')[:20]
    recentdata = [dict((cn, getattr(data, cn)) for cn in ('timestamp', 'mcdate', 'selection')) for data in recent]
    returndata={"id": record.id, "recent": recentdata}    

    return HttpResponse(json.dumps(returndata))


def getrecords(request):
    # records = [ dict((cn, getattr(data, cn)) for cn in ('v4futures', 'v4mini')) for data in UserSelection.objects.all() ]
    # print(records)
    # return HttpResponse(json.dumps(records))
    firstrec = UserSelection.objects.order_by('-timestamp').first()
    if firstrec == None:
        record = UserSelection(userID=json.dumps(UserSelection.default_userid),
                               selection=json.dumps(UserSelection.default_selection),
                               v4futures=json.dumps(UserSelection.default_jsonboard),
                               v4mini=json.dumps(UserSelection.default_jsonboard),
                               v4micro=json.dumps(UserSelection.default_jsonboard),
                               componentloc=json.dumps(UserSelection.default_cloc),
                               mcdate=MCdate(),
                               timestamp=getTimeStamp(), )
        record.save()
        firstrec = UserSelection.objects.order_by('-timestamp').first()

    filename = 'performance_data.json'
    if isfile(filename):
        with open(filename, 'r') as f:
            json_performance = json.load(f)
    else:
        list_performance = []
        with open(filename, 'w') as f:
            json.dump(list_performance, f)
        print 'Saved', filename
        json_performance = json.dumps(list_performance)

    filename = 'boxstyles_data.json'
    if isfile(filename):
        with open(filename, 'r') as f:
            json_boxstyles = json.load(f)
        print json_boxstyles
    else:
        with open(filename, 'w') as f:
            json.dump(UserSelection.default_list_boxstyles, f)
        print 'Saved', filename
        json_boxstyles=json.dumps(UserSelection.default_list_boxstyles)

    filename = 'customboard_data.json'
    if isfile(filename):
        with open(filename, 'r') as f:
            json_customstyles = json.load(f)
    else:
        with open(filename, 'w') as f:
            json.dump(UserSelection.default_list_customboard, f)
        print 'Saved', filename
        json_customstyles=json.dumps(UserSelection.default_list_customboard)

    firstdata = firstrec.dic()
    firstdata['performance'] = json_performance
    firstdata['boxstyles'] = json_boxstyles
    firstdata['customstyles'] = json_customstyles
    # print(json.dumps(firstdata))
    recent = UserSelection.objects.order_by('-timestamp')[:20]
    recentdata = [dict((cn, getattr(data, cn)) for cn in ('timestamp', 'mcdate', 'selection')) for data in recent]
    returndata={"first": firstdata, "recent": recentdata}
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))
    
def index(request):
    return render(request, 'board.html', {})

#def loading_page(request):
#    return render(request, 'loading_page.html', {})
def restart(request):
    #restart_webserver()
    return render(request, 'loading_page.html', {})

def board(request):
    return render(request, 'board.html', {})

def newboard(request):
    return render(request, 'newboard.html', {})

def gettimetable(request):
    returndata = get_timetables()
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getstatus(request):
    returndata = get_status()
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getmetadata(request):
    #returnrec = MetaData.objects.order_by('-timestamp').first()
    #returndata = returnrec.dic()
    returndata=updateMeta()
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getaccountdata(request):
    #request.GET['refresh']=='True'
    #    returndata= getAccountValues(refresh=True)
    #else:
    #    returndata= getAccountValues()
    returndata= getAccountValues()    
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getcustomsignals(request):
    returndata = getCustomSignals()
    #print(returndata)
    print len(returndata)
    return HttpResponse(returndata)

def getchartdata(request):
    returndata = getChartsDict()
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getcustomchip(request):
    if 'target' in request.GET:
        returndata = getCustomizeChip(target=int(request.GET['target']))      
    else:     
        returndata = getCustomizeChip()

    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def getnewsdata(request):
    returndata = getNews()
    #print(returndata)
    print len(returndata)
    return HttpResponse(json.dumps(returndata))

def symbols(request):
    futuresdict = get_futures_dictionary()
    return render(request, 'symbols.html', {'groups':futuresdict})

def futures(request, date=None):
    context={}
    if date==None:
        context['accounts']=get_overview()
        date=context['accounts']['v4futures']
        context['date']=dt.strptime(date, '%Y%m%d').strftime('%Y-%m-%d')
        context['archive'] = False
    else:
        context['accounts']={}
        accounts = ['v4micro', 'v4mini', 'v4futures']
        for account in accounts:
            context['accounts'][account] = date.replace('-','')
        context['date']=date
        context['archive']=True
    return render(request, 'futures2.html', context)

def timetable(request):
    eastern = timezone('US/Eastern')
    now = dt.now(get_localzone()).astimezone(eastern).strftime('%Y-%m-%d %H:%M:%S %p EST')

    return render(request, 'timetable.html', {'time':now, 'timetable':get_detailed_timetable()})

def order_status(request):
    context={'logfiles':[]}
    context['slippagedates'], context['orderstatus']=get_order_status()
    files = get_logfiles(search_string='moc_live')
    timestamp = sorted([f[-21:] for f in files])[-1]
    logfile=[f for f in files if 'error' not in f and timestamp in f][-1]
    context['logfiles'].append((logfile,LogFiles(logfile)))

    errorfiles= [f for f in files if logfile[-21:] in f and 'error' in f]
    if len(errorfiles)>0:
        errorfile=errorfiles[-1]
        context['logfiles'].append((errorfile,LogFiles(errorfile)))

    return render(request, 'show_log.html', context)

def errors(request):
    csidate = pd.read_sql('select distinct Date from futuresDF_results',
                          con=getBackendDB()).Date.tolist()[-1]

    files = get_logfiles(search_string='_error_')
    logs=[(logfile,LogFiles(logfile)) for logfile in files if int(logfile.partition('_error_')[-1].split('_')[0]) >= csidate]
    context = {'logfiles': logs}
    return render(request, 'show_errors.html', context)

def logs(request,logfile):
    #files = get_logfiles(search_string='_error_', exclude=True)
    print logfile
    context = {'logfiles': [(logfile,LogFiles('/logs/'+logfile))]}
    return render(request, 'show_logs.html', context)

def system_charts(request, symbol):
    imagedir = '/ml-tsdp/web/tsdp/betting/static/images/'
    filenames = [x for x in os.listdir(imagedir) if 'v4_'+symbol+'_' in x]
    return render(request, 'system_charts.html', {'charts':filenames})

def profile(request, username):
    user = User.objects.get(username=username)
    return render(request, 'profile.html', {'username': username})


def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            u = form.cleaned_data['username']
            p = form.cleaned_data['password']
            user = authenticate(username=u, password=p)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return HttpResponseRedirect('/')
                else:
                    print('The account has been disabled.')
                    return HttpResponseRedirect('/')
            else:
                print('The username and password were incorrect.')
                return HttpResponseRedirect('/')


    else:
        form = LoginForm()
        return render(request, 'login.html', {'form': form})


def logout_view(request):
    logout(request)
    return HttpResponseRedirect('/')


def register(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect('/login/')
    else:		
        form = UserCreationForm()
        return render(request, 'registration.html', {'form': form})


def last_userselection(request):
    #lastSelection = pd.read_sql('select * from betting_userselection where timestamp=\
    #        (select max(timestamp) from betting_userselection as maxtimestamp)', con=readConn, index_col='userID')
    lastSelection=UserSelection.objects.all().order_by('-timestamp')[0]
    return JsonResponse(lastSelection.dic())

def archive(request):
    return render(request, 'archive.html', {'dates':archive_dates()})