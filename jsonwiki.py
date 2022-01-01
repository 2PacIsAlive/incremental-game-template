#!/usr/bin/env python
"""Convert tables from Wikipedia into JSON."""
# https://gist.github.com/metaist/5729674

import argparse
import json
import sys

from bs4 import BeautifulSoup
import requests

API_URL = 'http://en.wikipedia.org/w/api.php?action=parse&format=json&page={0.page}&section={0.section}'

def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(prog='jsonwiki.py', description=__doc__)
    parser.add_argument('--version', action='version', version='%(prog)s 0.1')
    parser.add_argument('--proxy', metavar='URI', default=None,
                        help='HTTP proxy (e.g., example.com:80)')
    parser.add_argument('-o', '--output', metavar='FILE',
                        type=argparse.FileType('w'), default=sys.stdout,
                        help='output file (default: stdout)')
    parser.add_argument('-p', '--page', metavar='STR', type=str, required=True,
                        help='Wikipedia page (required)')
    parser.add_argument('-s', '--section', metavar='N', type=int, default=1,
                        help='section number (default: %(default)s)')
    parser.add_argument('-t', '--table', metavar='N', type=int, default=0,
                        help='table number (default: %(default)s)')

    return parser.parse_args()

def main():
    """Main entry point."""
    config = parse_args()
    proxies = None or (config.proxy and {'http': config.proxy})

    req = requests.get(API_URL.format(config), proxies=proxies)
    html = req.json()['parse']['text']['*']
    soup = BeautifulSoup(html)('table')[config.table]

    result, names = [], []
    for i, row in enumerate(soup('tr')):
        if 0 == i:
            names = [cell.text for cell in row('th')]
        else:
            row_result = {}
            for j, cell in enumerate(row('td')):
                row_result[names[j]] = cell.text
            result.append(row_result)

    print(config.output, json.dumps(result))

if '__main__' == __name__:
    main()
