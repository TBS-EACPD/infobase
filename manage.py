#!/usr/bin/env python
import subprocess
import sys,os
from optparse import OptionParser

here = os.path.realpath(__file__)
here_dir = os.path.split(here)[0]

def shell():
  from sqlalchemy import select, cast,join,func
  from my_libs import ipython
  from py import les, settings
  ipython.shell(locals())

def report():
  from py.reporting import html_les
  html_les()

def watch():
  from my_libs import watch_dir
  def rerunner():
    subprocess.call('coffee -o /home/andrew/Projects/les/js -c /home/andrew/Projects/les/coffee/*.coffee',shell=True)
    report()
  watch_dir.rerunner('./coffee',rerunner)

parser = OptionParser()
parser.add_option("-b","--shell",
                 action="store_true", dest="shell", default=False,
                 help="choose address")
parser.add_option("-r","--report",
                 action="store_true", dest="report", default=False,
                 help="run report")
parser.add_option("-w","--watch",
                 action="store_true", dest="watch", default=False,
                 help="watch for changes")

if __name__ == "__main__":
  # parse args
  args, left_over= parser.parse_args(sys.argv)
  # start server
  if args.shell:
    shell()
  if args.report:
    report()
  if args.watch:
    watch()

