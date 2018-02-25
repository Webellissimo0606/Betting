#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Fri Mar 17 21:41:44 2017

@author: hidemiasakura
"""

import sys
import requests

url = "http://localhost:8000/addrecord"
headers = {'content-type': 'application/json', 'Accept-Charset': 'UTF-8'}


data={
      "name":"asdf",
   "componentloc" : "test componentloc",
   "boxstyles" : "test box styles"
    }
requests.post(url, json=data, headers=headers)

'''
client = requests.session()

# Retrieve the CSRF token first
client.get(URL)  # sets cookie
csrftoken = client.cookies['csrf']

login_data = dict(username="testuser", password="t3st1ng", csrfmiddlewaretoken=csrftoken, next='/')
r = client.post(URL, data=login_data, headers=dict(Referer=URL))
'''