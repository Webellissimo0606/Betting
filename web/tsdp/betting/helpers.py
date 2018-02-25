import calendar
import os
from os.path import isfile
import re
import time
import math
import json
import datetime
import numpy as np
from datetime import datetime as dt
from pytz import timezone
from tzlocal import get_localzone
import sqlite3
import pandas as pd
from django import forms
from .models import UserSelection
from .start_moc import get_newtimetable, run_checksystems, run_vol_adjsize,\
                        update_chartdb, restart_webserver
debug = True

if debug:
    dbPath='futures.sqlite3'
    search_dir='./logs/'
else:
    search_dir = "/logs/"
    dbPath = '/ML-TSDP/data/futures.sqlite3'

class LogFiles(object):
    def __init__(self, filename):
        self.filename = filename

    def display_text_file(self):
        with open(self.filename) as fp:
            return fp.read()

def getBackendDB():
    global dbPath
    readConn = sqlite3.connect(dbPath)
    return readConn

def getChartDB():
    dbPath = 'db_charts.sqlite3'
    readConn = sqlite3.connect(dbPath)
    return readConn

def getNews():
    with open('news.txt','r') as f:
        newslines=f.readlines()    
        #print newslines    
    return newslines

def getTables(dbconn):
    dbcur = dbconn.cursor()
    dbcur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    #dbcur.execute("PRAGMA table_info(table-name);")
    tables=[x[0] for x in dbcur.fetchall()]
    dbcur.close()
    return tables

def getChartsDict():
    readConn=getChartDB()
    tables=getTables(readConn)
    chart_table_dict={}
    for table in tables:
        df = pd.read_sql('select * from {}'.format(table), con=readConn)
        print table, 'index:', df.columns[0]
        df=df.set_index(df.columns[0])
        chart_table_dict[table]=df.to_dict()
    return chart_table_dict

def getCustomizeChip(target=None):
    readConn=getBackendDB()
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn,\
                              index_col='CSIsym')
    feeddata = pd.read_sql('select * from feeddata', con=readConn,\
                              index_col='CSIsym')
    lastdate= pd.read_sql('select distinct Date from futuresATRhist',\
                          con=readConn).Date.tolist()[-1]
    futuresDF=pd.read_sql('select * from (select * from futuresATRhist\
                                          where Date=%s\
                    order by timestamp ASC) group by CSIsym'%lastdate,\
                        con=readConn,  index_col='CSIsym')

    accountInfo=pd.read_sql('select * from accountInfo where timestamp=\
                    (select max(timestamp) from accountInfo)',\
                    con=readConn,  index_col='index').drop(['timestamp','Date'],axis=1)
    ai_dict=accountInfo.to_dict()
    for account in ai_dict:
        ai_dict[account]['offline']=[x for x in\
                                       eval(accountInfo[account].offline)\
                                       if x in feeddata.index]
        
    images=listdir('./betting/static/public/images/')
    chip_images=filter(lambda x: 'chip_' in x, images)

    desc_list = futuresDict.ix[futuresDF.index].Desc.values
    desc_hyperlink = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
    desc_hyperlink = ['<a href="/static/images/v4_' + [futuresDict.index[i]\
                           for i, desc in enumerate(futuresDict.Desc) \
                  if re.sub(r'-[^-]*$', '', x) in desc][0] + \
                '_BRANK.png" target="_blank">' + x + '</a>' \
                for x in desc_hyperlink]
    markets_df=pd.concat([futuresDF[['usdATR','QTY','QTY_MINI','QTY_MICRO',\
                        'group']],feeddata[['Desc']]],\
                        axis=1).sort_values(by=['group'])
    markets_df.columns=[u'usdATR', u'QTY_v4futures', u'QTY_v4mini', u'QTY_v4micro', u'group', u'Desc']
    desc_list = markets_df.Desc.values
    desc_hyperlink = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
    desc_hyperlink = ['<a href="/static/images/v4_' + [futuresDict.index[i]\
                           for i, desc in enumerate(futuresDict.Desc) \
                  if re.sub(r'-[^-]*$', '', x) in desc][0] + \
                '_BRANK.png" target="_blank">' + x + '</a>' \
                for x in desc_hyperlink]
    markets_df['Desc']=desc_hyperlink
    markets_df['margin_v4futures']=feeddata.margin*markets_df.QTY_v4futures
    markets_df['margin_v4mini']=feeddata.margin*markets_df.QTY_v4mini
    markets_df['margin_v4micro']=feeddata.margin*markets_df.QTY_v4micro

    for account in ai_dict:
        markets_df['online_'+account]=[False if sym in ai_dict[account]['offline']\
                   else True for sym in markets_df.index]
    ai_dict2={account:{key:value for key,value in dic.items() if key\
                       not in ['selection','offline']} for account, dic\
                        in ai_dict.items()}

    markets_df=markets_df.transpose()
    json_markets_df=markets_df.to_json()
    modify_chip_dict={
            'accountinfo':ai_dict2,
           'chip_images':chip_images,
           'json_markets':json_markets_df
            }
    return modify_chip_dict

def get_logfiles(search_string='', exclude=False):
    global search_dir
    os.chdir(search_dir)
    files = filter(os.path.isfile, os.listdir(search_dir))
    if exclude:
        files = [os.path.join(search_dir, f) for f in files if search_string not in f]  # add path to each file
    else:
        files = [os.path.join(search_dir, f) for f in files if search_string in f]  # add path to each file

    files.sort(key=lambda x: os.path.getmtime(x))
    return files

class LoginForm(forms.Form):
    username = forms.CharField(label='User Name', max_length=64)
    password = forms.CharField(widget=forms.PasswordInput())

def MCdate():
    readConn = getBackendDB()
    timetables = pd.read_sql('select * from timetable', con=readConn, index_col='Desc')
    ttdates = timetables.drop(['Date','timestamp'],axis=1).columns.tolist()
    cutoff = datetime.time(17, 0, 0, 0)
    cutoff2 = datetime.time(23, 59, 59)
    eastern = timezone('US/Eastern')
    now = dt.now(get_localzone())
    now = now.astimezone(eastern)
    today = now.strftime("%Y%m%d")
    
    def guessMCdate():
        if now.time() > cutoff and now.time() < cutoff2:
            # M-SUN after cutoff, set next day
            next = now + datetime.timedelta(days=1)
            mcdate = next.strftime("%Y%m%d")
        else:
            # M-SUN before cutoff, keep same day
            mcdate = now.strftime("%Y%m%d")

        # overwrite weekends
        if now.weekday() == 4 and now.time() > cutoff and now.time() < cutoff2:
            # friday after cutoff so set to monday
            next = now + datetime.timedelta(days=3)
            mcdate = next.strftime("%Y%m%d")

        if now.weekday() == 5:
            # Saturday so set to monday
            next = now + datetime.timedelta(days=2)
            mcdate = next.strftime("%Y%m%d")

        if now.weekday() == 6:
            # Sunday so set to monday
            next = now + datetime.timedelta(days=1)
            mcdate = next.strftime("%Y%m%d")
        return mcdate
        
        
    if today in ttdates and ttdates.index(today)==0 and len(ttdates)>1:
        closes = pd.DataFrame(timetables[today].ix[[x for x in timetables.index if 'close' in x]].copy())
        lastclose=eastern.localize(max([x for x in pd.to_datetime(closes[today]) if x.day ==now.day]).to_pydatetime())
        if now>=lastclose :
            mcdate = ttdates[1]
        else:
            #now<lastclose
            mcdate =today
    elif len(ttdates)>0:
        next_ttdate = ttdates[-1]
        closes = pd.DataFrame(timetables[next_ttdate].ix[[x for x in timetables.index if 'close' in x]].copy())
        lastclose=eastern.localize(pd.to_datetime(closes[next_ttdate]).max().to_pydatetime())
        if now>=lastclose :
            #try last_ttdate
            #last_ttdate = ttdates[-1]
            #closes = pd.DataFrame(timetables[last_ttdate].ix[[x for x in timetables.index if 'close' in x]].copy())
            #lastclose = eastern.localize(pd.to_datetime(closes[last_ttdate]).max().to_pydatetime())
            #if (np.nan not in timetable[last_ttdate].tolist()) and now < lastclose:
            #    mcdate = last_ttdate
            #else:
            print('something wrong with timetable data. guessing next MCDATE')
            mcdate = guessMCdate()
        else:
            #now<lastclose
            mcdate =next_ttdate
    else:
        print('something wrong with timetable data. guessing next MCDATE')
        mcdate = guessMCdate()

    return mcdate

def getTimeStamp():
    timestamp = int(calendar.timegm(dt.utcnow().utctimetuple()))
    return timestamp

def get_futures_dictionary():
    readConn = getBackendDB()
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='CSIsym')
    groupdict = {group: {sym: futuresDict.ix[sym].to_dict() for sym in futuresDict.index if\
                            futuresDict.ix[sym].Group == group}\
                        for group in futuresDict.Group.unique()}
    return groupdict

def getComponents():
    ComponentsDict ={
                    'Off':['None'],
                    'Previous':['prevACT'],
                    'Anti-Previous':['AntiPrevACT'],
                    'RiskOn':['RiskOn'],
                    'RiskOff':['RiskOff'],
                    'Custom':['Custom'],
                    'Anti-Custom':['AntiCustom'],
                    '50/50':['0.75LastSIG'],
                    'LowestEquity':['0.5LastSIG'],
                    'HighestEquity':['1LastSIG'],
                    'AntiHighestEquity':['Anti1LastSIG'],
                    'Anti50/50':['Anti0.75LastSIG'],
                    'AntiLowestEquity':['Anti0.5LastSIG'],
                    'Seasonality':['LastSEA'],
                    'Anti-Seasonality':['AntiSEA'],
                    }
    return ComponentsDict

def getAntiComponents():
    componentpairs =[
                ['Previous','Anti-Previous'],
                ['RiskOn','RiskOff'],
                ['Custom','Anti-Custom'],
                ['50/50','Anti50/50'],
                ['LowestEquity','AntiLowestEquity'],
                ['HighestEquity','AntiHighestEquity'],
                ['Seasonality','Anti-Seasonality'],
                ]
    anti_component_dict={l[0]:l[1] for l in componentpairs}
    anti_component_dict.update({l[1]:l[0] for l in componentpairs})
    return anti_component_dict

def updateMeta():
    readConn = getBackendDB()
    mcdate=MCdate()
    timetables = pd.read_sql('select * from timetable', con=readConn, index_col='Desc')
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='IBsym')
    if mcdate not in timetables.columns:
        print('Running MOC to get new mcdate...')
        if not debug:
            get_newtimetable()
        mcdate=timetables.drop(['Date','timestamp'],axis=1).columns[-1]
        triggers = pd.DataFrame(timetables[mcdate].ix[[x for x in timetables.index if 'trigger' in x]].copy())
        triggers[mcdate] = 'Not Available'
    else:
        if timetables[mcdate].dropna().shape[0] == timetables.shape[0]:
            triggers = pd.DataFrame(timetables[mcdate].ix[[x for x in timetables.index if 'trigger' in x]].copy())
        else:
            triggers = pd.DataFrame(timetables[timetables.columns[0]].ix[[x for x in timetables.index if 'trigger' in x]].copy())

    triggers.index=[x.split()[0] for x in triggers.index]
    triggers.columns = [['Triggertime']]
    triggers['Group']=futuresDict.ix[triggers.index].Group.values
    triggers['Date']=mcdate
    #record = MetaData(components=json.dumps(getComponents()), triggers=json.dumps(triggers.transpose().to_dict()),\
    #                                mcdate=mcdate,\
    #                                timestamp=getTimeStamp())
    #record.save()
    metadata= {'components':getComponents(),'anticomponents':getAntiComponents(),
                         'triggers':triggers.transpose().to_dict(),
                                    'mcdate':mcdate, 'timestamp':getTimeStamp()}
    return metadata

def get_order_status():
    readConn = getBackendDB()
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='C2sym')

    orderstatus_dict={}
    slippage_files={}
    accounts = ['v4micro', 'v4mini', 'v4futures']

    def conv_sig(signals):
        sig = signals.copy()
        sig[sig == -1] = 'SHORT'
        sig[sig == 1] = 'LONG'
        sig[sig == 0] = 'NONE'
        return sig.values

    for account in accounts:
        col_order= ['broker','account','contract','description','openedWhen','urpnl',\
                'broker_position','broker_qty','signal_check','qty_check','selection','order_type']
        #webSelection=pd.read_sql('select * from webSelection where timestamp=\
        #        (select max(timestamp) from webSelection)'
        #bet = eval(webSelection.selection[0])[account][0]
        df=pd.read_sql('select * from (select * from %s\
                order by timestamp ASC) group by c2sym' % ('checkSystems_'+account),\
                con=readConn)
        df['system_signal'] = conv_sig(df['system_signal'])
        df['broker_position'] = conv_sig(df['broker_position'])
        desc_list=futuresDict.ix[[x[:-2] for x in df.contract.values]].Desc.values
        df['description']=[re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
        orderstatus_dict[account]=df[col_order].to_html()
        csidate = pd.read_sql('select distinct csiDate from slippage where Name=\'{}\''.format(account), con=readConn).csiDate.tolist()[-1]
        slippage_files[account]=str(csidate)
        if account == "v4futures":
            col_order=['desc','contracts','qty','price','value','avg_cost','unr_pnl','real_pnl','accountid','currency','bet','ordertype','status','Date']
            df = pd.read_sql('select * from (select * from %s\
                    order by timestamp ASC) group by ibsym' % ('checkSystems_ib_' + account), \
                             con=readConn)
            desc_list = [futuresDict.reset_index().set_index('IBsym').ix[x].Desc for x in df.ibsym]
            df['desc'] = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
            orderstatus_dict[account+'_ib'] = df[col_order].to_html()
            csidate = pd.read_sql('select distinct Date from ib_slippage where Name=\'{}\''.format(account),
                                  con=readConn).Date.tolist()[-1]
            slippage_files[account+'_ib'] = str(csidate)


    return slippage_files, orderstatus_dict

def getAccountValues(refresh=False):
    readConn = getBackendDB()
    mcdate = MCdate()
    eastern = timezone('US/Eastern')
    utc = timezone('UTC')
    now = dt.now(get_localzone())
    now = now.astimezone(eastern)
    accountvalues = {}
    urpnls = {}

    if not debug and refresh:
        get_newtimetable()

    # ib
    ib_equity = pd.read_sql('select * from ib_accountData where timestamp=\
                (select max(timestamp) from ib_accountData) and Desc=\'NetLiquidation\'', \
                            con=readConn, index_col='Desc')
    timestamp = utc.localize(dt.utcfromtimestamp(ib_equity.timestamp)).astimezone(eastern)
    accountvalue = int(float(ib_equity.value[0]))
    accountvalues['v4futures'] = {
        'col1title': 'Account Value', 'col1value': accountvalue, \
        'col2title': 'Timestamp', 'col2value': timestamp.strftime('%Y-%m-%d %I:%M:%S %p EST')
    }

    ib_urpnl = pd.read_sql('select * from ib_accountData where timestamp=\
                (select max(timestamp) from ib_accountData) and Desc=\'UnrealizedPnL\' and currency=\'BASE\'', \
                           con=readConn, index_col='Desc')
    timestamp = utc.localize(dt.utcfromtimestamp(ib_urpnl.timestamp)).astimezone(eastern)
    urpnl = int(float(ib_urpnl.value[0]))
    urpnls['v4futures'] = {
        'col1title': 'UnrealizedPnL', 'col1value': urpnl, \
        'col2title': 'Timestamp', 'col2value': timestamp.strftime('%Y-%m-%d %I:%M:%S %p EST')
    }

    # C2
    c2_equity = pd.read_sql('select * from (select * from c2_equity order by timestamp ASC) group by system', \
                            con=readConn, index_col='system')
    c2_equity.updatedLastTimeET = pd.to_datetime(c2_equity.updatedLastTimeET)

    #run checksystems and update values if last update >=1 day and not a T,W,TH,F,SA
    if (now-eastern.localize(c2_equity.updatedLastTimeET[0])).days>=1 and (now.weekday()>0 and now.weekday()<5):
        if not debug:
            run_checksystems()

    for system in c2_equity.drop(['v4futures'], axis=0).index:
        timestamp = c2_equity.ix[system].updatedLastTimeET
        accountvalue = int(c2_equity.ix[system].modelAccountValue)
        urpnl = int(c2_equity.ix[system].equity)

        urpnls[system] = {
            'col1title': 'UnrealizedPnL', 'col1value': urpnl, \
            'col2title': 'Timestamp', 'col2value': timestamp.strftime('%Y-%m-%d %I:%M:%S %p EST')
        }
        accountvalues[system] = {
            'col1title': 'Account Value', 'col1value': accountvalue, \
            'col2title': 'Timestamp', 'col2value': timestamp.strftime('%Y-%m-%d %I:%M:%S %p EST')
        }
    '''
    c2_v4micro = pd.read_sql('select * from c2_portfolio where timestamp=\
          (select max(timestamp) from c2_portfolio where system=\'v4micro\')', con=readConn)

    c2_v4mini = pd.read_sql('select * from c2_portfolio where timestamp=\
          (select max(timestamp) from c2_portfolio where system=\'v4mini\')', con=readConn)

    c2_v4futures = pd.read_sql('select * from c2_portfolio where timestamp=\
          (select max(timestamp) from c2_portfolio where system=\'v4futures\')', con=readConn)
    '''

    #record = AccountData(value1=json.dumps(urpnls), value2=json.dumps(accountvalues),mcdate=mcdate,\
    #                                timestamp=getTimeStamp())
    #record.save()
    accountdata={'value1':json.dumps(urpnls), 'value2':json.dumps(accountvalues),'mcdate':mcdate,\
                                    'timestamp':getTimeStamp()}
    return accountdata

def getCustomSignals():
    readConn=getBackendDB()
    readPriceConn=getChartDB()

    lastdate= pd.read_sql('select distinct Date from futuresATRhist',\
                          con=readConn).Date.tolist()[-1]
    futuresDF=pd.read_sql('select * from (select * from futuresATRhist\
                                          where Date=%s\
                    order by timestamp ASC) group by CSIsym'%lastdate,\
                        con=readConn,  index_col='CSIsym')

    futuresDict = pd.read_sql('select * from Dictionary', con=readConn,\
                              index_col='CSIsym')

    desc_list = futuresDict.ix[futuresDF.index].Desc.values
    desc_hyperlink = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
    desc_hyperlink = ['<a href="/static/images/v4_' + [futuresDict.index[i]\
                           for i, desc in enumerate(futuresDict.Desc) \
                  if re.sub(r'-[^-]*$', '', x) in desc][0] + \
                '_BRANK.png" target="_blank">' + x + '</a>' \
                for x in desc_hyperlink]
    df=pd.DataFrame(data=dict(Group=futuresDF.group.values,\
                              Markets=desc_hyperlink,
                                Default=futuresDF.Custom.values),
                                index=futuresDF.index)

    filename='custom_signals_data.json'
    if isfile(filename):
        with open(filename, 'r') as f:
            custom_signals_data = json.load(f)
        #custom_signals_data=custom_signals_data[custom_signals_data.keys()[0]]
        name=custom_signals_data['name']
        df['signals']=pd.Series(custom_signals_data['customsignals'])
    else:
        name='Custom'
        custom_signals_data={'name':name,
                'customsignals':df.sort_values(by=['Group'])['Default']\
                                                     .transpose().to_dict()}
        with open(filename, 'w') as f:
            json.dump(custom_signals_data,f)
        print 'Couldn\'t find',filename,'Saved new file'
        df['signals']=df['Default'].copy()
        
        
    df=df[['Markets','Group','signals','Default']]
    df['Anti-Default']=np.where(df.Default>0,-1,1)

    for sym in df.index:
        filename=dataPath+futuresDict.Filename.ix[sym]+'_B.CSV'
        print sym, isfile(filename)
        if isfile(filename):
            data=pd.read_csv(filename)
            data.columns = columns
            tablename = 'pricedata_'+sym
            data.to_sql(name=tablename,con=readPriceConn, index=False,
                        if_exists='replace')
            print 'Wrote', tablename,'to db_charts.sqlite3'
            data2=data[-max(lookbacks)-1:]
            #print data2.shape
            for lookback in lookbacks:
                col_name=str(lookback)+'-Day %Chg'
                pctchg=data2.Close.pct_change(periods=lookback).values[-1]
                signal=1 if pctchg>0 else -1
                df.set_value(sym, col_name, signal)
                df.set_value(sym, 'Anti-'+col_name, -signal)
                #print col_name, pctchg, signal

    customsignals=df.sort_values(by=['Group']).transpose().to_json()

    return {'name':name, 'customsignals':customsignals}

def recreateCharts(custom_signals=None, accountinfo=None):
    if custom_signals is not None:
        filename='custom_signals_data.json'
        with open(filename, 'w') as f:
            json.dump(custom_signals, f)
        print 'Saved', filename

        firstrec = UserSelection.objects.order_by('-timestamp').first()
        cloc=eval(firstrec.dic()['componentloc'])
        if 'Custom' in [dic.values()[0] for dic in cloc]:
            #load boxstyles text name
            cloc=[dic.keys()[0] for dic in cloc if dic.values()[0]=='Custom'][0]
            filename='boxstyles_data.json'
            if isfile(filename):
                with open(filename, 'r') as f:
                    boxstyles = json.load(f)
                    
                for dic in boxstyles:
                    if loc in dic.keys():
                        print dic, dic[loc]['text']
                        dic[loc]['text']=name
                        print dic[loc]['text']
                        
                with open(filename, 'w') as f:
                    json.dump(boxstyles, f)
                    print 'Saved',filename,'updated custom name',name
            else:
                print filename,'could not be found'

        print('updating chart db with custom signals')
        #run_vol_adjsize()
        pass

    if accountinfo is not None:
        print accountinfo
        filename='accountinfo_data.json'
        #save_dict={'name':name, 'customsignals':custom_signals_data}
        with open(filename, 'w') as f:
             json.dump(accountinfo, f)
        print 'Saved',filename
        
    #time.sleep(15)
    #update_chartdb()
    pass

def get_detailed_timetable():
    active_symbols_ib = {
        'v4futures': ['AUD', 'ZL', 'GBP', 'ZC', 'CAD', 'CL', 'EUR', 'EMD', 'ES', 'GF', 'ZF', 'GC', 'HG', 'HO', 'JPY',
                      'LE', 'HE', 'MXP', 'NZD', 'NG', 'NIY', 'NQ', 'PA', 'PL', 'RB', 'ZS', 'CHF', 'SI', 'ZM', 'ZT',
                      'ZN', 'ZB', 'ZW', 'YM'],
        'v4mini': ['ZC', 'CL', 'EUR', 'EMD', 'ES', 'HG', 'JPY', 'NG', 'ZM', 'ZT', 'ZN', 'ZW'],
        'v4micro': ['ZL', 'ES', 'HG', 'NG', 'ZN'],
        }
    readConn = getBackendDB()
    mcdate = MCdate()
    eastern = timezone('US/Eastern')
    utc = timezone('UTC')
    now = dt.now(get_localzone()).astimezone(eastern)
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='IBsym')
    timetables = pd.read_sql('select * from timetable', con=readConn, index_col='Desc').drop(['Date', 'timestamp'], axis=1)

    if mcdate in timetables and timetables[mcdate].dropna().shape[0]==timetables.shape[0]:
        ttdate = mcdate
        # filter out any dates that have passed
        ttdates = [x for x in timetables.columns if int(x) >= int(mcdate)]
        timetables = timetables[ttdates]
    else:
        # use old dates
        ttdate = timetables.columns[0]

    timetableDF = pd.DataFrame()
    for idx, [sym, value] in enumerate([x.split() for x in timetables.index]):
        idx2 = sym + ' ' + value
        timestamp = timetables.ix[idx2].ix[ttdate]
        timetableDF.set_value(sym, value, timestamp)

    #timetableDF.index.name = 'ibsym'
    for sym in timetableDF.index:
        opentime = eastern.localize(dt.strptime(timetableDF.ix[sym].open, '%Y-%m-%d %H:%M'))
        closetime = eastern.localize(dt.strptime(timetableDF.ix[sym].close, '%Y-%m-%d %H:%M'))
        if now >= opentime and now < closetime:
            timetableDF.set_value(sym, 'immediate order type', 'Open: Market Order')
        else:
            # market is closed
            if now < opentime:
                nextopen = opentime.strftime('%A, %b %d %H:%M EST')
            elif len(timetables.drop(ttdate, axis=1).columns) > 0:
                next_ttdate = timetables.drop(ttdate, axis=1).columns[0]
                nextopen = timetables[next_ttdate].ix[sym + ' open']
                if not (nextopen is not None and nextopen is not np.nan):
                    nextopen = 'Not Avalable'
                else:
                    if now < eastern.localize(dt.strptime(nextopen, '%Y-%m-%d %H:%M')):
                        pass
                    else:
                        nextopen = 'Not Available'
            else:
                nextopen = 'Not Available'
            timetableDF.set_value(sym, 'immediate order type', 'Closed: Market on Open ({})'.format(nextopen))

    col_order = ['group', 'immediate order type', 'open', 'close', 'trigger']
    # timetableDF=timetableDF[col_order]
    # print timetableDF
    # ttDict={account:timetableDF.ix[active_symbols_ib[account]].to_html() for account in active_symbols_ib}
    ttDict = {}
    for account in active_symbols_ib:
        df = timetableDF.ix[active_symbols_ib[account]]
        df['group'] = futuresDict.ix[df.index].Group
        desc_list = futuresDict.ix[df.index].Desc.values
        df.index = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
        ttDict[account] = df[col_order].sort_values(by='group').to_html()
    return ttDict

def get_overview():
    readConn = getBackendDB()
    accounts = ['v4micro', 'v4mini', 'v4futures']
    overviewDict={}
    for account in accounts:
        totalsDF = pd.read_sql('select * from {}'.format('totalsDF_board_' + account), con=readConn, index_col='Date')
        date = str(totalsDF.index[-1])
        overviewDict[account]=date
    return overviewDict

def archive_dates():
    readConn = getBackendDB()
    dates = pd.read_sql('select distinct Date from futuresATRhist', con=readConn).Date.tolist()
    startdate = 20170106
    datetup=[(dt.strptime(str(x), '%Y%m%d').strftime('%A, %b %d, %Y'),\
              dt.strptime(str(x), '%Y%m%d').strftime('%Y-%m-%d')) for x in\
             sorted(dates[dates.index(startdate):], reverse=True)]
    return datetup
    

def get_blends(cloc, list_boxstyles=None, returnVotingComponents=True):
    def is_int(s):
        try:
            int(s)
            return True
        except ValueError:
            return False

    #if cloc == None:
    #    firstrec=UserSelection.objects.order_by('-timestamp').first()
    #    cloc = eval(firstrec.dic()['componentloc'])
    #    print cloc

    if list_boxstyles == None:
        filename='boxstyles_data.json'
        with open(filename, 'r') as f:
            list_boxstyles = json.load(f)
        #list_boxstyles = UserSelection.default_list_boxstyles
    #else:
    #    list_boxstyles = [d for d in list_boxstyles if not is_int(d.keys()[0])]
    #print([cl.keys()[0] for cl in cloc])
    component_styles = {bs.keys()[0]: bs.values()[0] for bs in list_boxstyles if
                        bs.keys()[0] in [cl.keys()[0] for cl in cloc]}
    component_names = {cl.keys()[0]: cl.values()[0] for cl in cloc}

    # get from board js
    h_components = 6
    v_components = 6
    v_components_width = 2
    h_components_width = outside_components = 2
    table_height = 3

    table_width = num_v_component_boxes = h_components * outside_components
    num_h_component_boxes = outside_components * table_height
    total_boxes = table_height * table_width
    start_vert = outside_components + h_components
    end_vert = outside_components + h_components + v_components

    # figure this out later..
    # mod:boxkeys
    # vboxdict={0:['c9','c10'].
    #                2:['c11','c12'],
    #                1:['c13','c14'],
    #            }
    vboxdict = {}
    vboxlist = [x for x in range(table_height - 1, 0, -1)]
    vboxlist.insert(0, 0)
    for x in vboxlist:
        vboxdict[x] = []
        for y in range(0, v_components_width):
            start_vert += 1
            # print x,y,start_vert
            vboxdict[x].append('c' + str(start_vert))

    # 1-6 +c3 ... 31-36 +c8
    boxidDict = {}
    for boxid in range(1, total_boxes + 1):
        # print
        h_component = int(math.ceil(boxid / float(num_h_component_boxes)))
        boxidDict[str(boxid)] = ['c' + str(h_component + outside_components)]
        o_component = int(math.ceil(boxid / float(table_height))) - outside_components * (h_component - 1)
        boxidDict[str(boxid)] += ['c' + str(o_component)]
        boxidDict[str(boxid)] += vboxdict[boxid % table_height]

    boxstyleDict = {boxid: [component_styles[x] for x in boxidDict[boxid] if component_names[x] != 'None'] for
                    boxid
                    in boxidDict}


    blendedboxstyleDict = {}
    for boxid, list_of_styles in boxstyleDict.items():
        if len(list_of_styles) > 0:
            # fillhex_test={}
            R = 0
            G = 0
            B = 0
            for i, style in enumerate(list_of_styles):
                blendedstyle = style.copy()
                # fillhex_test[i]=('%02x%02x%02x' % (int(style['fill-R']), int(style['fill-G']), int(style['fill-B']))).upper()
                R += int(blendedstyle['fill-R'])
                G += int(blendedstyle['fill-G'])
                B += int(blendedstyle['fill-B'])
                # print i, blendedstyle, R, G, B
            i += 1
            BR = int(R / float(i))
            BG = int(G / float(i))
            BB = int(B / float(i))
            fillhex = ('%02x%02x%02x' % (BR, BG, BB)).upper()
            # print i, BR, BG, BB, fillhex
            # blended = blend_colors(list_of_blendedstyles)
            L = 0
            ldict = {'r': 0.2126, 'g': 0.7152, 'b': 0.0722}
            for color, value in [('r', BR), ('g', BG), ('b', BB)]:
                c = value / 255.0
                if c <= 0.03928:
                    c = c / 12.92
                else:
                    c = ((c + 0.055) / 1.055) ** 2.4
                L += c * ldict[color]
            textcolor = '000000' if L > 0.179 else 'FFFFFF'
            # print L, textcolor

            blendedstyle.update({
                'fill-R': str(BR),
                'text-color': textcolor,
                'fill-Hex': fillhex,
                'fill-G': str(BG),
                'fill-B': str(BB),
                'text': str(boxid),
                # 'text-size': '24',
                # 'text-blendedstyle': 'bold',
                # 'text-font': 'Book Antigua',
                # 'fill-colorname': 'blended'
            })
            blendedboxstyleDict[boxid] = blendedstyle
            # print boxid, style
        else:
            blendedboxstyleDict[boxid] = {'filename': '',
                                          'fill-B': '255',
                                          'fill-G': '255',
                                          'fill-Hex': 'FFFFFF',
                                          'fill-R': '255',
                                          'text': '',
                                          'text-color': 'FFFFFF',
                                          'text-font': 'Arial Black',
                                          'text-size': '18',
                                          'text-style': 'bold'}
    #keys = blendedboxstyleDict.keys()
    #keys.sort(key=int)
    indices = [i for i,d in enumerate(list_boxstyles) if is_int(d.keys()[0])]
    #list_boxstyles += [{key: blendedboxstyleDict[key]} for key in keys]
    for i in indices:
        key=list_boxstyles[i].keys()[0]
        list_boxstyles[i]={key: blendedboxstyleDict[key]}
        print(list_boxstyles[i])

    print(list_boxstyles)
    filename = 'boxstyles_data.json'
    with open(filename, 'w') as f:
        json.dump(list_boxstyles, f)
    print('Saved', filename)

    if returnVotingComponents:
        votingComponents = {boxid: [getComponents()[component_names[x]][0] for x in clist if component_names[x] != 'None']
                            for boxid, clist in boxidDict.items()}
        #print [[x, votingComponents[x]] for x in sorted(votingComponents.keys(), key=int)]
        print(votingComponents)
        return votingComponents
    # return cloc, list_boxstyles

def get_timetables():
    active_symbols_ib = {
        'v4futures': ['AUD', 'ZL', 'GBP', 'ZC', 'CAD', 'CL', 'EUR', 'EMD', 'ES', 'GF', 'ZF', 'GC', 'HG', 'HO', 'JPY',
                      'LE', 'HE', 'MXP', 'NZD', 'NG', 'NIY', 'NQ', 'PA', 'PL', 'RB', 'ZS', 'CHF', 'SI', 'ZM', 'ZT',
                      'ZN', 'ZB', 'ZW', 'YM'],
        'v4mini': ['ZC', 'CL', 'EUR', 'EMD', 'ES', 'HG', 'JPY', 'NG', 'ZM', 'ZT', 'ZN', 'ZW'],
        'v4micro': ['ZL', 'ES', 'HG', 'NG', 'ZN'],
        }
    readConn = getBackendDB()
    mcdate = MCdate()
    eastern = timezone('US/Eastern')
    utc = timezone('UTC')
    now = dt.now(get_localzone()).astimezone(eastern)
    now_str=now.strftime('%Y-%m-%d %I:%M:%S %p EST')
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='IBsym')
    timetables = pd.read_sql('select * from timetable', con=readConn, index_col='Desc').drop(['Date', 'timestamp'],
                                                                                             axis=1)

    if mcdate in timetables:
        ttdate = mcdate
        # filter out any dates that have passed
        ttdates = [x for x in timetables.columns if int(x) >= int(mcdate)]
        timetables = timetables[ttdates]
    else:
        # use old dates
        ttdate = timetables.columns[0]

    timetableDF = pd.DataFrame()
    for idx, [sym, value] in enumerate([x.split() for x in timetables.index]):
        idx2 = sym + ' ' + value
        timestamp = timetables.ix[idx2].ix[ttdate]
        timetableDF.set_value(sym, value, timestamp)

    #timetableDF.index.name = 'ibsym'
    for sym in timetableDF.index:
        opentime = eastern.localize(dt.strptime(timetableDF.ix[sym].open, '%Y-%m-%d %H:%M'))
        closetime = eastern.localize(dt.strptime(timetableDF.ix[sym].close, '%Y-%m-%d %H:%M'))
        if now >= opentime and now < closetime:
            timetableDF.set_value(sym, 'immediate order type', 'Open: Market Order')
        else:
            # market is closed
            if now < opentime:
                nextopen = opentime.strftime('%A, %b %d %H:%M EST')
            elif len(timetables.drop(ttdate, axis=1).columns) > 0:
                next_ttdate = timetables.drop(ttdate, axis=1).columns[0]
                nextopen = timetables[next_ttdate].ix[sym + ' open']
                if not (nextopen is not None and nextopen is not np.nan):
                    nextopen = 'Not Avalable'
                else:
                    if now < eastern.localize(dt.strptime(nextopen, '%Y-%m-%d %H:%M')):
                        pass
                    else:
                        nextopen = 'Not Available'
            else:
                nextopen = 'Not Available'
            timetableDF.set_value(sym, 'immediate order type', 'Closed: Market on Open ({})'.format(nextopen))

    col_order2 = ['group', 'open', 'close', 'trigger']
    col_order = ['group', 'immediate order type']
    # timetableDF=timetableDF[col_order]
    # print timetableDF
    # ttDict={account:timetableDF.ix[active_symbols_ib[account]].to_html() for account in active_symbols_ib}
    ttDict = {}
    for account in active_symbols_ib:
        df = timetableDF.ix[active_symbols_ib[account]]
        df['group'] = futuresDict.ix[df.index].Group
        desc_list = futuresDict.ix[df.index].Desc.values
        df.index = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
        df.index = ['<a href="/static/images/v4_' + [futuresDict.index[i] for i, desc in enumerate(futuresDict.Desc) \
                      if re.sub(r'-[^-]*$', '', x) in desc][0] + '_BRANK.png" target="_blank">' + x + '</a>' for x in df.index]
        text='This table lets you know what order types will be used for '+account+' if immediate is entered now.<br><br>Server Time: '+now_str
        ttDict[account] = {
                            'text':text,
                            'html':df[col_order].sort_values(by='group').to_html(escape=False),
                            }
        if account == 'v4futures':
            text = 'Detailed Timetable.<br>All times in Eastern Standard Time.<br><br>Server Time: ' + now_str
            ttDict['info'] = {
                            'text':text,
                            'html':df[col_order2].sort_values(by='group').to_html(escape=False)
                            }
    return ttDict


def get_status():
    eastern = timezone('US/Eastern')
    utc = timezone('UTC')
    pngPath='static/images/'
    readConn = getBackendDB()
    futuresDict = pd.read_sql('select * from Dictionary', con=readConn, index_col='C2sym')
    futuresDict2 = pd.read_sql('select * from Dictionary', con=readConn, index_col='CSIsym')

    #col_order = ['broker', 'account', 'contract', 'description', 'openedWhen', 'urpnl', \
    #             'broker_position', 'broker_qty', 'signal_check', 'qty_check', 'selection', 'order_type']
    #col_order_ib = ['desc', 'contracts', 'qty', 'price', 'value', 'avg_cost', 'unr_pnl', 'real_pnl', 'accountid',
    #             'currency', 'bet', 'ordertype', 'status', 'Date']
    col_order_status = ['selection', 'order_type', 'signal_check', 'qty_check']
    col_order_status_ib = ['bet', 'ordertype', 'status']
    col_order_pnl = ['contract', 'urpnl','broker_position', 'broker_qty', 'openedWhen']
    col_order_pnl_ib = ['contracts', 'unr_pnl', 'real_pnl', 'currency', 'value', 'qty', 'Date']
    orderstatus_dict={}
    #slippage_files={}
    accounts = ['v4micro', 'v4mini', 'v4futures']

    def conv_sig(signals):
        sig = signals.copy()
        sig[sig == -1] = 'SHORT'
        sig[sig == 1] = 'LONG'
        sig[sig == 0] = 'NONE'
        return sig.values

    for account in accounts:
        orderstatus_dict[account]={}
        orderstatus_dict[account]['tab_list'] = ['Status', 'UnrealizedPNL', 'Slippage']
        #webSelection=pd.read_sql('select * from webSelection where timestamp=\
        #        (select max(timestamp) from webSelection)'
        #bet = eval(webSelection.selection[0])[account][0]
        df=pd.read_sql('select * from (select * from %s\
                order by timestamp ASC) group by c2sym' % ('checkSystems_'+account),\
                con=readConn)
        timestamp=utc.localize(dt.utcfromtimestamp(df.timestamp[0])).astimezone(eastern).strftime('%Y-%m-%d %I:%M:%S %p EST')
        df['system_signal'] = conv_sig(df['system_signal'])
        df['broker_position'] = conv_sig(df['broker_position'])
        desc_list=futuresDict.ix[[x[:-2] for x in df.contract.values]].Desc.values
        df['description']=[re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
        df=df.set_index(['description'])
        df.index=['<a href="/static/images/v4_' + [futuresDict2.index[i] for i, desc in enumerate(futuresDict2.Desc) \
                  if re.sub(r'-[^-]*$', '', x) in desc][0] + '_BRANK.png" target="_blank">' + x + '</a>' for x in df.index]
        orderstatus_dict[account]['title_txt']=account+' Order Status'
        orderstatus_dict[account]['status']=df[col_order_status].to_html(escape=False)
        orderstatus_dict[account]['status_text']='This table lets you know the status of your last bet/orders. For example, if your bet was correctly transmitted and received by your broker, it would say OK.<br><br>Last Update: '+timestamp
        orderstatus_dict[account]['pnl'] = df[col_order_pnl].to_html(escape=False)
        orderstatus_dict[account]['pnl_text']='This table displays the details of your open positions in your account portfolio.<br><br>Last Update: '+str(timestamp)
        csidate = pd.read_sql('select distinct csiDate from slippage where Name=\'{}\''.format(account), con=readConn).csiDate.tolist()[-1]
        orderstatus_dict[account]['slippage']=pngPath+account+'_c2_slippage_'+str(csidate)+'.png'
        orderstatus_dict[account]['slippage_text']='The slippage graph shows the datetime your last orders were entered and how much it differs from the official close price. With immediate orders slippage will show the net loss/gain you get from entering earlier than at the MOC<br><br>Last Update: '+str(timestamp)
        if account == "v4futures":
            df = pd.read_sql('select * from (select * from %s\
                    order by timestamp ASC) group by ibsym' % ('checkSystems_ib_' + account), \
                             con=readConn)
            timestamp = utc.localize(dt.utcfromtimestamp(df.timestamp[0])).astimezone(eastern).strftime(
                '%Y-%m-%d %I:%M:%S %p EST')
            desc_list = [futuresDict.reset_index().set_index('IBsym').ix[x].Desc for x in df.ibsym]
            df['desc'] = [re.sub(r'\(.*?\)', '', desc) for desc in desc_list]
            df=df.set_index(['desc'])
            df.index = ['<a href="/static/images/v4_' + [futuresDict2.index[i] for i, desc in enumerate(futuresDict2.Desc) \
                         if re.sub(r'-[^-]*$', '', x) in desc][0] + '_BRANK.png" target="_blank">' + x + '</a>' for x in df.index]
            #orderstatus_dict[account+'_ib'] = df[col_order].to_html()
            orderstatus_dict[account]['title_txt'] = account + ' Order Status'
            orderstatus_dict[account]['status'] = df[col_order_status_ib].to_html(escape=False)
            orderstatus_dict[account]['status_text']='This table lets you know the status of your last bet/orders. For example, if your bet was correctly transmitted and received by your broker, it would say OK.<br><br>Last Update: '+timestamp
            orderstatus_dict[account]['pnl'] = df[col_order_pnl_ib].to_html(escape=False)
            orderstatus_dict[account]['pnl_text']='This table displays the details of your open positions in your account portfolio.<br><br>Last Update: '+str(timestamp)
            csidate = pd.read_sql('select distinct Date from ib_slippage where Name=\'{}\''.format(account),
                                  con=readConn).Date.tolist()[-1]
            #slippage_files[account+'_ib'] = str(csidate)
            orderstatus_dict[account]['slippage'] = pngPath+account + '_ib_slippage_' + str(csidate) + '.png'
            orderstatus_dict[account]['slippage_text']='The slippage graph shows the datetime your last orders were entered and how much it differs from the official close price. With immediate orders slippage will show the net loss/gain you get from entering earlier than at the MOC<br><br>Last Update: ' + str(
                timestamp)
    return orderstatus_dict