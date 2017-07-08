"""
CYPRESS F-RAM Dumper
CY15B104Q - http://www.cypress.com/file/209146/download
4-Mbit (512 K x 8) Serial (SPI) F-RAM
"""

import sys
import spidev
from binascii import hexlify

# opcodes
# READ [0000 0011b] --> Read memory data
# RDID [1001 1111b] --> Read device Id
READ = 0x03
RDID = 0x9F

def device_id(spi):
    """Device Id reader"""
    resp = spi.xfer2([RDID] + 9 * [0x00])
    return hexlify(bytes(resp[1:]))

def dump_memory(spi):
    """Memory dumper"""
    # 24 bits for the address(19 useful bits)
    dump = []
    for addr in range(524288):
        address = []
        for byte in addr.to_bytes(3, byteorder='big', signed=True):
            address.append(byte)
        resp = spi.xfer2([READ] + address + [0x00])
        dump.append(resp[4])
    return bytes(dump)

def main():
    """Let's dump"""
    if len(sys.argv) != 2:
        print('Usage: {} output_file'.format(sys.argv[0]))
        sys.exit(0)
    # Use device 0.0, 8 bpw, mode 0, CS active low
    # MSBit first, max 8MHz
    spi = spidev.SpiDev()
    spi.open(0, 0)
    spi.bits_per_word = 8
    spi.max_speed_hz = 8000000
    spi.cshigh = False
    spi.mode = 0
    spi.loop = False
    spi.lsbfirst = False
    spi.threewire = False

    try:
        # Read device Id
        print('Device Id:')
        print(device_id(spi))
        print()

        # Dump memory
        print('[*] Dumping memory...')
        with open(sys.argv[1], 'wb') as fd:
            fd.write(dump_memory(spi))
        print('[*] Done !')
    except KeyboardInterrupt:
        spi.close()
        sys.exit(0)


if __name__ == '__main__':
    main()
