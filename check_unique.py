import json
import threading
import requests

fname = "probes.txt"

end_pos1 = 0;

def check_within():
    global end_pos1
    threading.Timer(60.0, check_within).start()
    unique_list = []
    return_list = []
    print("Executing check_within()")
    with open(fname) as f:
        print(end_pos1)
        f.seek(end_pos1)
        for line in f:
            # print(line)
            spl_str = line.split()
            if spl_str[2] not in unique_list:
                unique_list.append(spl_str[2])
            end_pos1 += len(line)
        print(end_pos1)
        url = "http://ec2-34-201-43-197.compute-1.amazonaws.com:3000/macaddress"
        querystring = {"op":"getall"}
        headers = {}
        response = requests.request("GET", url, headers=headers, params=querystring)
        resData = response.json();
        for macaddress in resData["data"]:
            if macaddress in unique_list:
                return_list.append(macaddress)
        print(return_list)
        if return_list:
            url = "http://ec2-34-201-43-197.compute-1.amazonaws.com:3000/macaddress"
            querystring = {"op":"postarray"}
            headers = {"Content-type": "application/json"}
            # print(unique_list)
            send_data={}
            send_data["data"]=return_list
            payload = json.dumps(send_data)
            print(payload)
            #print(payload)
            response = requests.request("POST", url, data=payload, headers=headers, params=querystring)
            print(response.text)


check_within()