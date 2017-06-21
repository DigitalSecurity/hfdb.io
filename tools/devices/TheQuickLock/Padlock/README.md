TheQuickLock Padlock log collection tool
========================================

This forensic utility extracts the whole event log from a memory dump along with the configured PIN code.

How to use this collection tool
-------------------------------

```
$ python padlock-logs.py -d memory-dump.bin
[i] PIN code is: 14451616
[i] Extracting events from first page (0x3D800)
[2016-07-01T12:01:30][ OPEN  ] Dixon
...
[2017-01-17T11:58:33][ OPEN  ] victor
[2017-01-17T13:06:41][ OPEN  ] victor
[2017-01-17T13:07:12][ OPEN  ] victor
[i] Extracting events from second page (0x3E000)
[2017-01-17T13:10:27][ OPEN  ] victor
[2017-01-17T13:22:53][ OPEN  ] victor
...
[2017-04-06T19:33:04][ OPEN  ] digital
[2017-04-06T19:33:22][ OPEN  ] digital
[2017-04-06T21:08:56][ OPEN  ] digital
[2017-04-10T10:55:06][ OPEN  ] digital
```
