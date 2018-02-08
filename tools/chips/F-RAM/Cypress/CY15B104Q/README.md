CYPRESS 4-Mbit (512 K x 8) Serial (SPI) F-RAM Dumper
====================================================

This forensic tool dumps the content of a Cypress 4-Mbit (512 K x 8) Serial (SPI) F-RAM:

* CY15B104Q - http://www.cypress.com/file/209146/download

Requirements
------------

* A Raspberry Pi with its raspbian's SPI master driver enabled:

```
Use raspi-config or uncomment dtparam=spi=on in /boot/config
```

* The Python Spidev module for interfacing with SPI devices from user space via the spidev linux kernel driver:

```
$ sudo apt-get update sudo apt-get install python-dev
$ git clone git://github.com/doceme/py-spidev
$ cd py-spidev
$ sudo python setup.py install
```

* Correct wiring:
```
   F-RAM                      Raspberry Pi
[1] CS   --------------- [24] BCM 8 (SPI0 CE0)
[2] SO   --------------- [21] BCM 9 (SPI0 MISO)
[3] WP   --------------- [20] Ground 
[4] VSS  --------------- [20] Ground
[5] SI   --------------- [19] BCM 10 (SPI0 MOSI)
[6] SCK  --------------- [23] BCM 11 (SPI0 SCLK)
[7] HOLD --------------- [20] Ground
[8] VDD  --------------- [17] Power (3.3V)
```

How to use this tool
--------------------

```
$ sudo spi_dump.py <output_file>
```
