import xlrd
from ..reporting import table_defs
tables = table_defs.tables
f  = '/media/KINGSTON/TBSSCT-#1016155-v36-LES_2011-12.XLS'
#f2 = '/media/KINGSTON/les_lookup.xls'

wb = xlrd.open_workbook(f)
#wb2 = xlrd.open_workbook(f2)

def clean_data(d):
  if isinstance(d,basestring):
    d = d.strip('*').strip()
    # try and convert to an integer
    # if it fails, then return the string
    try:
      d = int(d)
    except:
      return d
  if isinstance(d, float) and int(d) == d:
    return int(d)
  return d

def clean_row(r):
  return map(clean_data,r)

def each_sheet(ws,start=1):
  return ws.name, filter(lambda r : any(bool(x) for x in r),
                      map(lambda i : clean_row(ws.row_values(i)),
                          range(start,ws.nrows)))

def fix_min_dept(rows):
  en = {x[0]:x[1] for x in rows}
  fr = {x[2]:x[3] for x in rows}
  return {x:{'en': en[x],'fr':fr[x]} for x in en}

def fix_votes(rows,lookup):
  reverse_lookup = {lookup[k]['en']: k for k in lookup}
  try:

    return {'%d:%d' % (r[0],r[1]) : reverse_lookup[r[2]] for r in rows}
  except Exception, ecp:
    import pdb
    pdb.set_trace()


def make_key(dept_num,vote_num):
  return "{0}:{1}".format(dept_num,vote_num)

def lookups(data_sheets):
  lookups = {}
  lookups['d_e'] = {}
  lookups['d_f'] = {}
  lookups['m_e'] = {}
  lookups['m_f'] = {}
  lookups['min_dept'] = {}
  lookups['vote_type_inyear'] = {}
  lookups['vote_type_hist'] = {}
  lookups['stat_en_fr'] = {}
  lookups['paa_en_fr'] = {}
  for row in data_sheets['DATA1'][tables['DATA1']['start_row']:]:
    lookups['d_e'][row[0]] = row[1]
    lookups['d_f'][row[0]] = row[21]
    lookups['vote_type_inyear'][make_key(row[0],row[2])] = {'en' : row[3],
                                                            'fr': row[23]}
  for row in data_sheets['DATA2'][tables['DATA2']['start_row']:]:
    lookups['d_e'][row[0]] = row[6]
    lookups['d_f'][row[0]] = row[26]
    if row[8] == 's' :
      lookups['stat_en_fr'][row[9]] = row[29]
    else:
      lookups['vote_type_inyear'][make_key(row[0],row[8])] = {'en' : row[9],
                                                              'fr': row[29]}
  for row in data_sheets['DATA2A'][tables['DATA2A']['start_row']:]:
    lookups['paa_en_fr'][row[2]] = row[25]
  for row in data_sheets['DATA2B'][tables['DATA2B']['start_row']:]:
    if row[8]:
      if make_key(row[0],row[8]) not in lookups['vote_type_inyear']:
        import pdb
        pdb.set_trace()
  for row in data_sheets['DATA3'][tables['DATA3']['start_row']:]:
    if row[3]:
      if make_key(row[0],row[3]) not in lookups['vote_type_inyear']:
        import pdb
        pdb.set_trace()
  for row in data_sheets['DATA4'][tables['DATA4']['start_row']:]:
    lookups['vote_type_hist'][make_key(row[0],row[5])] = {'en':row[6],
                                                          'fr':row[29]}
  for row in data_sheets['DATA5'][tables['DATA5']['start_row']:]:
    lookups['vote_type_hist'][make_key(row[0],row[4])] = {'en':row[5],
                                                          'fr':row[35]}
  for row in data_sheets['DATA6'][tables['DATA6']['start_row']:]:
    lookups['vote_type_hist'][make_key(row[0],row[4])] = {'en':row[5],
                                                          'fr':row[26]}
  for row in data_sheets['DATA7'][tables['DATA7']['start_row']:]:
    lookups['vote_type_hist'][make_key(row[0],row[3])] = {'en':row[4],
                                                          'fr':row[31]}
  return lookups

def load():
  data_sheets = dict(map(each_sheet,
                         filter(lambda x : 'DATA' in x.name,
                                    wb.sheets())))
  return lookups(data_sheets),data_sheets



  #lookups['min_lookup'] = fix_min_dept(lookups['min_lookup'])
  #lookups['dept_lookup'] =fix_min_dept(lookups['dept_lookup'])
  #lookups['d_e'] = {y['en']:x for x,y in lookups['dept_lookup'].iteritems()}
  #lookups['d_f'] = {y['fr']:x for x,y in lookups['dept_lookup'].iteritems()}
  #lookups['m_e'] = {y['en']:x for x,y in lookups['min_lookup'].iteritems()} 
  #lookups['m_e'] = {y['fr']:x for x,y in lookups['min_lookup'].iteritems()} 
  #lookups['min_dept'] = [[x[0],x[2]] for x in lookups['min_dept']]
  #lookups['vote_type_hist'] = {x[0] : {'en' : x[1],'fr' : x[2]}
  #                             for x in lookups['vote_type_hist']}
  #lookups['vote_type_inyear'] = {x[0] : {'en' : x[1],'fr' : x[2]} 
  #                               for x in lookups['vote_type_inyear']}
  #lookups['in_year_vote'] = fix_votes(lookups['in_year_vote'],lookups['vote_type_inyear'])
  #lookups['hist_vote'] = fix_votes(lookups['hist_vote'],lookups['vote_type_hist'])
  #lookups['stat_en_fr'] = {x[0]:{'en':x[0],'fr':x[1]} for x in lookups['stat_en_fr']}
  #lookups['paa_en_fr'] = {x[2]:{'en':x[2],'fr':x[25]} for x in data_sheets['DATA2A']}

