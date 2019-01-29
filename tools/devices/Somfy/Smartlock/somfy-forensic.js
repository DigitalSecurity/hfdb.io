const argparse = require('argparse');
const noble = require('noble');

var parser = new argparse.ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: 'Somfy smartlock forensic tool'
});
parser.addArgument(['-t', '--target'], {
  help: 'Bluetooth address (MAC address) of the target smartlock',
  required: true
});
args = parser.parseArgs();

if (args.target != undefined) {
    var tx_uuid = 'fff1';
    var rx_uuid = 'fff2';
    var tx_char = null;
    var rx_char = null;

    var entryLogs = null;
    var smartlock = null;

    function showEntryLogs() {
      if (entryLogs[1] == 0x02) {
        /* Get logs count. */
        var nb_entries = entryLogs.readUInt16BE(2);
        for (var i=0; i<nb_entries;i++) {
          var record = entryLogs.slice(4+17*i,4+17*(i+1));
          /* Get logid */
          var logid = record.slice(4,11);
          if (logid[0] == 0x80) {
            /* Virtual Key */
            var log_type = logid.readUInt8(0);
            var data_type = logid.readUInt16BE(2);
            var hw_id = logid.readUIntBE(4,3);
            var state_error = record.readUInt16BE(11);

            /* Date */
            var date = new Date(2000,0,1);
            var secs = record.readUInt32BE(13);
            //console.log('seconds: '+secs.toString(16));
            date.setSeconds(secs);

            /* Display log entry. */
            var index = record.readUInt32BE(0);
            console.log('#### Event ID: '+index);
            console.log(' Type      : Virtual Key');
            console.log(' User ID   : '+hw_id.toString(16));
            switch(state_error) {
              case 1:
                console.log(' Event     : Lock closed');
                break;
              case 2:
                console.log(' Event     : Lock opened');
                break;
              case 4:
                console.log(' Event     : Lock synchronized');
                break;
              case 0x8019:
                console.log(' Event     : Manual');
                break;
              case 0x8002:
                console.log(' Event     : Sequence mismatch');
                break;
              case 0x8004:
                console.log(' Event     : No permission');
                break;
              case 0x8000:
                console.log(' Event     : Operation failed');
                break;
              case 0x8001:
                console.log(' Event     : Timestamp mismatch');
                break;
              default:
                console.log(' Event      :'+state_error.toString(16));
            }
            console.log(' Date      : '+date.toString());
            console.log('######################');
            console.log('');
          } else {
            /* Tag. */
            var tagid = Buffer.concat([record.slice(0,1), record.slice(2,7)]).toString('hex');
            var state_error = record.readUInt16BE(11);

            /* Date */
            var date = new Date(2000,0,1);
            var secs = record.readUInt32BE(13);
            date.setSeconds(secs);

            /* Display log entry. */
            var index = record.readUInt32BE(0);
            console.log('#### Event ID: '+index);
            console.log(' Type      : Tag');
            console.log(' User ID   : '+tagid.toString(16));

            switch(state_error) {
              case 1:
                console.log(' Event     : Lock closed');
                break;
              case 2:
                console.log(' Event     : Lock opened');
                break;
              case 4:
                console.log(' Event     : Lock synchronized');
                break;
              case 0x8019:
                console.log(' Event     : Manual');
                break;
            }
            console.log(' Date      : '+date.toString());
            console.log('######################');
            console.log('');

          }
        }

      } else {
        console.log('Not an entry log response.');
      }
      process.exit(0);
    }

    function readEntryLog() {
      /* Set Rx callback. */
      rx_char.on('data', function(data, isnotif){
        if (isnotif) {
          if (data[0] != 0xe1) {
            data_size = data[0]&0x1f;
            if (entryLogs == null) {
              entryLogs = data.slice(1, data_size+1);
            } else {
              entryLogs = Buffer.concat([entryLogs, data.slice(1, data_size+1)]);
            }
            if ((data[0] & 0x40) == 0x40) {
              tx_char.write(new Buffer([0xe1, 0x04]), false, function(){
                /* unsubscribe, disconnect and show entry log. */
                rx_char.unsubscribe(function(error){
                  smartlock.disconnect();
                  showEntryLogs();
                });
              });
            } else {
              tx_char.write(new Buffer([0xe1, 0x04]));
            }
          }
        }
      });

      /* Subscribe for notification on rx_char. */
      rx_char.subscribe();

      tx_char.write(new Buffer([0xC8, 0x1C, 0x01, 0xff, 0xff, 0xff, 0xff, 0x00, 0x0a]));
    };

    /* Découverte de périphérique. */
    noble.on('discover', function(peripheral) {
        if (peripheral.address.toUpperCase() == args.target.toUpperCase()) {
            /* On arrête de scanner. */
            noble.stopScanning();

            smartlock = peripheral;

            /* On se connecte au périphérique. */
            peripheral.connect(function(error) {
                if (error == null) {
                    /* On cherche le service de communication (fff0). */
                    peripheral.discoverServices(['fff0'], function(error, services){
                        if (services.length == 1) {
                          var service = services[0];
                          /* On liste les characteristics de ce service (une seule). */
                          service.discoverCharacteristics(['fff1','fff2'], function(error, characs) {
                            for (var c in characs) {
                              var charac = characs[c];
                              if (charac.uuid == tx_uuid) {
                                tx_char = charac;
                              } else if (charac.uuid == rx_uuid) {
                                rx_char = charac;
                              }
                              if ((rx_char!=null) && (tx_char!=null))
                                readEntryLog();
                            }
                          });
                        }
                    });
                }
            });

        }
    });

    noble.on('stateChange', function(state) {
        if (state == 'poweredOn') {
            noble.startScanning();
        } else {
            console.log('Adapter not ready.');
        }
    });
}
