@echo off
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%%MM%%DD%" & set "timestamp=%HH%%Min%%Sec%"
set "fullstamp=%YYYY%%MM%%DD%_%HH%-%Min%-%Sec%"
@echo on

rem cd \ML-TSDP\
rem \anaconda2\python post_processing.py >> \logs\post_processing_%fullstamp%.txt

cd \ml-tsdp\web\tsdp\
wmic process where "Commandline like '%%manage.py runserver%%' and name like '%%python.exe%%'" call terminate
\anaconda2\python runserver.py

