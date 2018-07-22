import threading
import requests
import qrcode
from PIL import Image
import array
import os
import json

fname = "probes.txt"

end_pos = 0

def gen_fr_qr():
    img = qrcode.make('WIFI:S:"lastweeksecretwifi";P"";;')
    img.save("fr_qr.PNG");
    os.system("open fr_qr.PNG");
    #img2.show();

def gen_sd_qr(x):
    img = qrcode.make('SMSTO:16012285571:' + '/register ' + x + '')
    img.save("sn_qr.PNG");
    os.system("open sn_qr.PNG");

def sendit():
    global end_pos
    threading.Timer(5.0, sendit).start()
    with open(fname) as f:
        f.seek(end_pos)
        for line in f:
            # print(line)
            spl_str = line.split()
            if spl_str[3] == "\"\"lastweeksecretwifi\"\"":
                print(spl_str[3])
                url = "http://ec2-34-201-43-197.compute-1.amazonaws.com:3000/macaddress"
                querystring = {"op":"create","addr":spl_str[2]}

                headers = {
                    'Cache-Control': "no-cache",
                    'Postman-Token': "81b03ce7-33c7-464b-9f6d-b6db2362bb61"
                    }
                response = requests.request("POST", url, headers=headers, params=querystring)
                jsonfrStr = json.loads(response.text)
                print(jsonfrStr["status"])
                if jsonfrStr["status"] != 'again':
                    gen_sd_qr(jsonfrStr["status"])

                print(response.text)
            end_pos += len(line)

gen_fr_qr()
sendit()