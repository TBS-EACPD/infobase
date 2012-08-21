import codecs
import operator
import functools
import os
import operator
import json
import redis
from ..loading import load
from ..settings import lookup
from .table_defs import tables

js_root = '/home/andrew/Projects/media/js'
js_files = ['00-jquery-1.7.2.js',
            '01-underscore-min.js',
            '02-backbone.js',
            'jquery-ui-1.8.18.custom.min.js',
            'jshashtable-2.1.js',
            'jquery.numberformatter-1.2.3.js',
            "jquery.dataTables.min.js"
           ]

css_root = '/home/andrew/Projects/media/css'
css_files = ['base.css',
             'ui-darkness/jquery-ui-1.8.18.custom.css']

opn = functools.partial(codecs.open,encoding='utf-8')

def transform_data(departments,data):
  # d is a dict which index departmental data
  try:
    d = departments
    for table in data:
      rows = data[table]
      tdef = tables[table]
      for row in rows[tdef['start_row']:]:
        extract = functools.partial(operator.getitem,row)
        #clean = lambda x : int(x) if isinstance(x,float)  else x
        f = extract
        dept = extract(tdef['dept_field'])
        d[dept].setdefault(table,[]).append(map(f,tdef['keep_fields']))
  except Exception,e:
    import pdb
    pdb.set_trace()
    pass

def remove_vote_0_lines(data):
  for dept in data:
    for table in data[dept]:
      if table not in ('DATA2A',):
        data[dept][table] = filter(lambda x : x[0] != 0 and dept != 52,
                                   data[dept][table])
        if not data[dept][table]:
          pass

def html_les():
  r = redis.Redis()
  r.flushdb()
  if 'les' in r:
    extra_js =  r.get('les')
  else:
    lookups,data = load()
    lookups['data'] = {k:{} for k in lookups['d_e']}
    del data['DATA8']
    transform_data(lookups['data'], data)
    remove_vote_0_lines(lookups['data'])
    lookups['les_tables'] = tables
    extra_js = reduce(operator.add,
                      map(lambda k : '%s=%s;\n' % (k,json.dumps(lookups[k])),
                          lookups))
    r.set('les',extra_js)

  jsdata = reduce(operator.add,
                  map(lambda f : opn(os.path.join(js_root,f)).read()+";\n",
                      js_files))

  cssdata = reduce(operator.add,
                  map(lambda f : opn(os.path.join(css_root,f)).read(),
                      css_files))

  with open('/media/KINGSTON/les2/Libraries/jsondata.js','w') as jsondata:
    jsondata.write(extra_js+"\n")

  full_js = jsdata + u"\n" + extra_js
  full_css = cssdata

  t = lookup.get_template('les.html')
  with open("les.html",'w') as leshtml:
    leshtml.write(t.render(full_js = full_js, full_css = full_css))


