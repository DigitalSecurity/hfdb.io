const argparse = require('argparse');
const noble = require('noble');

var parser = new argparse.ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: 'Diamond mini event log extraction tool'
});
parser.addArgument(['-t', '--target'], {
  help: 'Bluetooth Address of the target smartlock',
});
args = parser.parseArgs();

if (args.target != undefined) {
    var tx_uuid = 'fff1';
    var rx_uuid = 'fff2';
    var tx_char = null;
    var rx_char = null;

    var entryLogs = null;
    var smartlock = null;

    var state = null;
    var num_records = 0;
    var cur_record = 0;
    var record_time = null;
    var record_measure = null;

    var addChecksum = function(buffer) {
      var checksum = 0;
      for (i=0; i<buffer.length; i++) {
        checksum += buffer[i];
      }
      var csbuf = new Buffer(buffer.length+1);
      buffer.copy(csbuf);
      csbuf[buffer.length] = checksum;
      return csbuf;
    };

    var send = function(buffer){
      var final_buf = addChecksum(buffer);
      tx_char.write(final_buf);
    }

    function readMeasures() {
      /* Set Rx callback. */
      rx_char.on('data', function(data, isnotif){
        nextStep(data);
      });

      /* Subscribe for notification on rx_char. */
      rx_char.subscribe();

      nextStep(new Buffer([0x51,0x00]));
    };

    var nextStep = function(data){
      switch(data[1]) {
        case 0x00:
          /* Wake up */
          state = 'wakeup';
          send(new Buffer([81, 34, 0, 0, 0, 0, 163]));
          break;

        case 0x22:
          /* Read number of measures. */
          if (data[6]==0xa5) {
            state = 'query';
            send(new Buffer([81, 43, 0, 0, 0, 0, 163]));
          }
          break;

        case 0x2b:
          /* Reading measures. */
          if (data[6] == 0xa5) {
            state = 'reading';
            if (cur_record == null) {
              var num_records = data[2] + (data[3]<<8);
              var newest = data[4] + (data[5]<<8);
              console.log('Number of records: '+num_records);
              console.log('Newest record index is: '+newest);
              console.log('');
              console.log('--- Records ----');
              var cur_record = 0;
              var recl = (cur_record & 0x00ff);
              var rech = (cur_record & 0xff00)>>8;

              /* request record time. */
              record_time = null;
              record_measure = null;
              send(new Buffer([81, 37, recl, rech, 0, 0, 163]));
            }
          }
          break;

        case 0x25:
          if (data[6]==0xa5) {
            var day = data[2] & 0x1F;
            var month = ((data[2] & 0xE0)>>5) + (data[3]&0x1)<<3;
            var year = (data[3]>>1);
            var minute = (data[4] & 0x3F);
            var hour = (data[5]&0x1f);
            record_time = day+'/'+month+'/'+year + ' '+hour+':'+minute;

            var recl = (cur_record & 0x00ff);
            var rech = (cur_record & 0xff00)>>8;
            send(new Buffer([81, 38, recl, rech, 0, 0, 163]));
          }
          break;

        case 0x26:
          if (data[6]==0xa5) {
            record_measure = data[2] + (data[3]<<8);
            console.log(record_time+' - '+record_measure+' mg/dL');
            if (cur_record < num_records) {
              record_time = null;
              record_measure = null;
              cur_record++;
            } else {
              /* EOT. */
              send(new Buffer([81, 80, 0, 0, 4, 0, 163]));
            }
          }
          break;

        case 0x50:
          process.exit(0);
          break;
      }
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
                    peripheral.discoverServices(['000015231212efde1523785feabcd123'], function(error, services){
                        if (services.length == 1) {
                          var service = services[0];
                          /* On liste les characteristics de ce service (une seule). */
                          service.discoverCharacteristics(['000015241212efde1523785feabcd123'], function(error, characs) {
                            for (var c in characs) {
                              var charac = characs[c];
                              tx_char = charac;
                              rx_char = charac;
                              readMeasures();
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
            console.log('Reader ready, turn on and off glucometer to read !');
            console.log('');
            noble.startScanning();
        } else {
            console.log('Adapter not ready.');
        }
    });
}
