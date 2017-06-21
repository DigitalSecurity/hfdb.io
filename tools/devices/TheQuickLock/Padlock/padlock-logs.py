"""
TheQuickLock log extracting tool

This tool extracts the event log from dumped flash memory.

Two pages (2 x 8kbyte) are allocated to the logfile:
    - 0x3D800
    - 0x3E000
"""
import datetime
import time
import sys
import argparse
from struct import unpack

def parse_event(event):
    """
    Parse the 20-byte long event
    """
    # retrieve name size (should not be 00 or FF)
    name_size = ord(event[0])
    if name_size == 0 or name_size == 0xFF:
        return None
    # get name and timestamp
    name = event[1:1+name_size]
    timestamp = unpack('<I', event[0xf:0xf+4])[0]
    start = datetime.date(2000,1,1)
    offset = time.mktime(start.timetuple())
    timestamp = offset+timestamp
    event_datetime = datetime.datetime.fromtimestamp(timestamp)
    status = ord(event[-1])
    if status == 2 or status==4:
        status = 'close'
    else:
        status = 'open'
    return event_datetime, status, name

if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description='TheQuickLock padlock log collection tool'
    )
    parser.add_argument(
        '--dumpfile',
        '-d',
        dest='dumpfile',
        required=True
    )
    args = parser.parse_args()


    f = open(args.dumpfile, 'rb').read()
    pincode = f[0x3B806:0x3B806+4].encode('hex')
    logs = f[0x3D800:]

    # Display PIN code
    print '[i] PIN code is: %s' % pincode

    # log size: 20 bytes
    print '[i] Extracting events from first page (0x3D800)'
    offset = 0x3D800
    event_info = 1
    while event_info is not None and offset<0x3E000:
        event_info = parse_event(f[offset:offset+20])
        if event_info is not None:
            if event_info[1] == 'open':
                print '[%s][ OPEN  ] %s' % (event_info[0].isoformat(), event_info[2])
            else:
                print '[%s][ CLOSE ] %s' % (event_info[0].isoformat(), event_info[2])
            offset += 20

    print '[i] Extracting events from second page (0x3E000)'
    offset = 0x3E000
    event_info = 1
    while event_info is not None and offset<0x3E800:
        event_info = parse_event(f[offset:offset+20])
        if event_info is not None:
            if event_info[1] == 'open':
                print '[%s][ OPEN  ] %s' % (event_info[0].isoformat(), event_info[2])
            else:
                print '[%s][ CLOSE ] %s' % (event_info[0].isoformat(), event_info[2])
            offset += 20
