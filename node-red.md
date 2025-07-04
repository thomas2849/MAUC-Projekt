```json
[
    {
        "id": "9fd6a8fbdd54f728",
        "type": "tab",
        "label": "Flow 1",
        "disabled": false,
        "info": "",
        "env": []
    },
    {
        "id": "54887c0be4b3df11",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "maze/data",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 460,
        "y": 280,
        "wires": [
            [
                "6535ef1a4e342d1d"
            ]
        ]
    },
    {
        "id": "6535ef1a4e342d1d",
        "type": "debug",
        "z": "9fd6a8fbdd54f728",
        "name": "debug 1",
        "active": true,
        "tosidebar": true,
        "console": false,
        "tostatus": false,
        "complete": "payload",
        "targetType": "msg",
        "statusVal": "",
        "statusType": "auto",
        "x": 780,
        "y": 280,
        "wires": []
    },
    {
        "id": "409748cf74284dc4",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "arduino/position",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 500,
        "y": 220,
        "wires": [
            [
                "6535ef1a4e342d1d"
            ]
        ]
    },
    {
        "id": "76ba0a732307a342",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "maze/timer",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 400,
        "y": 360,
        "wires": [
            [
                "6535ef1a4e342d1d",
                "63a692c4d41bc242"
            ]
        ]
    },
    {
        "id": "109f58d45de78eba",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "maze/game_state",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 410,
        "y": 480,
        "wires": [
            [
                "6535ef1a4e342d1d",
                "22010315c2d98d92"
            ]
        ]
    },
    {
        "id": "3de32dd1f02e8067",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "maze/rewards",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 450,
        "y": 580,
        "wires": [
            [
                "6535ef1a4e342d1d"
            ]
        ]
    },
    {
        "id": "22010315c2d98d92",
        "type": "ui_text",
        "z": "9fd6a8fbdd54f728",
        "group": "aee96dddb19fae70",
        "order": 0,
        "width": 0,
        "height": 0,
        "name": "",
        "label": "Status",
        "format": "{{msg.payload}}",
        "layout": "row-spread",
        "className": "",
        "style": true,
        "font": "",
        "fontSize": "20",
        "color": "#31c21e",
        "x": 1010,
        "y": 420,
        "wires": []
    },
    {
        "id": "9c48a7c0afa5e6a3",
        "type": "mqtt in",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "topic": "maze/reward_count",
        "qos": "0",
        "datatype": "auto-detect",
        "broker": "ea3dfbb48a45d338",
        "nl": false,
        "rap": true,
        "rh": 0,
        "inputs": 0,
        "x": 470,
        "y": 680,
        "wires": [
            [
                "6535ef1a4e342d1d",
                "9a9d532fc9b511a4"
            ]
        ]
    },
    {
        "id": "63a692c4d41bc242",
        "type": "ui_text",
        "z": "9fd6a8fbdd54f728",
        "group": "aee96dddb19fae70",
        "order": 2,
        "width": 0,
        "height": 0,
        "name": "",
        "label": "Zeit",
        "format": "{{msg.payload}}",
        "layout": "row-spread",
        "className": "",
        "style": true,
        "font": "Arial,Arial,Helvetica,sans-serif",
        "fontSize": "32",
        "color": "#000000",
        "x": 1050,
        "y": 700,
        "wires": []
    },
    {
        "id": "9a9d532fc9b511a4",
        "type": "ui_gauge",
        "z": "9fd6a8fbdd54f728",
        "name": "",
        "group": "aee96dddb19fae70",
        "order": 3,
        "width": 0,
        "height": 0,
        "gtype": "donut",
        "title": "Gesammlte Punkte",
        "label": "units",
        "format": "{{value}}",
        "min": 0,
        "max": "15",
        "colors": [
            "#00b500",
            "#e6e600",
            "#ca3838"
        ],
        "seg1": "",
        "seg2": "",
        "diff": false,
        "className": "",
        "x": 1050,
        "y": 500,
        "wires": []
    },
    {
        "id": "ea3dfbb48a45d338",
        "type": "mqtt-broker",
        "name": "",
        "broker": "localhost",
        "port": "1883",
        "clientid": "",
        "autoConnect": true,
        "usetls": false,
        "protocolVersion": 4,
        "keepalive": 60,
        "cleansession": true,
        "autoUnsubscribe": true,
        "birthTopic": "",
        "birthQos": "0",
        "birthRetain": "false",
        "birthPayload": "",
        "birthMsg": {},
        "closeTopic": "",
        "closeQos": "0",
        "closeRetain": "false",
        "closePayload": "",
        "closeMsg": {},
        "willTopic": "",
        "willQos": "0",
        "willRetain": "false",
        "willPayload": "",
        "willMsg": {},
        "userProps": "",
        "sessionExpiry": ""
    },
    {
        "id": "aee96dddb19fae70",
        "type": "ui_group",
        "name": "Game",
        "tab": "8cd6a8d0c874f09d",
        "order": 1,
        "disp": true,
        "width": 6,
        "collapse": false,
        "className": ""
    },
    {
        "id": "8cd6a8d0c874f09d",
        "type": "ui_tab",
        "name": "Home",
        "icon": "dashboard",
        "disabled": false,
        "hidden": false
    }
]
```