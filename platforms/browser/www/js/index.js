/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);

        var dbSize = 5 * 1024 * 1024; // 5MB

        var db = openDatabase("Todo", "", "Todo manager", dbSize, function() {
            console.log('db successfully opened or created');
        });

        db.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS todo(ID INTEGER PRIMARY KEY ASC, todo TEXT, added_on TEXT)",
                [], onSuccess, onError);
            tx.executeSql("INSERT INTO todo(todo, added_on) VALUES (?,?)", ['super my todo item', new Date().toUTCString()], onSuccess, onError);
        });

        function onSuccess(transaction, resultSet) {
            console.log('Query completed: ' + JSON.stringify(resultSet));
        }

        function onError(transaction, error) {
            console.log('Query failed: ' + error.message);
        }

        //SELECT
        db.transaction(function (tx) { 
        tx.executeSql('SELECT * FROM todo', [], function (tx, results) { 
              var len = results.rows.length, i; 
              msg = "<p>Found rows: " + len + "</p>"; 
              document.querySelector('#status').innerHTML +=  msg; 

              for(var i=0; i<results.rows.length; i++) {
                var row = results.rows.item(i);
                document.querySelector('#status').innerHTML += row["todo"]+"<br/>";
              }
          
           }, null); 
        });
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();