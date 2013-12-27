#!/usr/bin/python
project = "mediawiki/extensions/MobileFrontend"
GERRIT_URL = "https://gerrit.wikimedia.org/r/changes/?q=status:open+project:%s&n=25&O=1"%project
import simplejson
from httplib2 import Http
import datetime
from datetime import datetime as dt
import time
from subprocess import call

def calculate_age( timestamp ):
  time_string = timestamp[0:18]
  format = "%Y-%m-%d %H:%M:%S"
  try:
    d = datetime.datetime.strptime( time_string, format )
  except AttributeError:
    d = dt( *( time.strptime( time_string, format )[0:6] ) )
  delta = d.now() - d
  age = delta.days
  if age < 0:
    age = 0
  return age

#run...


def calculate_score( change ):
  #go through reviews..
  reviews = change["labels"]["Code-Review"]
  likes = 0
  dislikes = 0
  status = 0
  reviewers = []

  if "recommended" in reviews:
    likes += 1

  if "disliked" in reviews:
    dislikes += 1

  if "rejected" in reviews:
    dislikes += 2

  #calculate status
  if dislikes > 0:
    status = -dislikes
  else:
    status = likes
  return status

def query_gerrit():
  h = Http()
  resp, content = h.request( GERRIT_URL, 'GET',
  headers={ "Accept": "application/json,application/json,application/jsonrequest",
    "Content-Type": "application/json; charset=UTF-8"
  } )
  # deal with weird gerrit response...
  content = content.split( '\n' )
  content = content[1:]
  data = simplejson.loads( '\n'.join( content ) )
  return data

def get_patches():
  patches = []
  for change in query_gerrit():
    user = change["owner"]["name"]
    subj = change["subject"]
    number = change["_number"]
    url = 'https://gerrit.wikimedia.org/r/%s'%number

    patch = { "user": user, "subject": subj,
      "score": calculate_score( change ),
      "id": '%s' % number,
      "url": url,
      "age": calculate_age( change["created"] ) }
    patches.append( patch )

  def sorter(a, b):
    if a[ "score" ] == b[ "score" ]:
      if a[ "age" ] > b[ "age" ]:
        return -1
      else:
        return 1
    else:
      if a[ "score" ] > b["score"]:
        return -1
      else:
        return 1

  patches.sort(sorter)
  return patches

if __name__ == '__main__':
  RED = '\033[91m'
  GREEN = '\033[92m'
  ENDC = '\033[0m'
  BOLD = "\033[1m"

  patches = get_patches()
  #start on 1 since 1 is the easiest key to press on the keyboard
  key = 1
  print 'Open patchsets listed below in priority order:\n'
  for patch in patches:
    score = patch["score"]
    if score < 0:
      color = RED
    else:
      color = GREEN
    score = '%s%s%s%s' % ( color, BOLD, score, ENDC )
    print '%s: %s (%s days old) [%s]' % ( key, patch["subject"], patch["age"], score )
    key += 1
  print '\n'
  prompt = 'Enter number of commit you would like to review (Press enter to exit): '
  choice = raw_input(prompt)
  try:
    change = patches[int(choice) - 1]
    call( [ "git", "review", "-d", change["id"] ] )
    print 'Review at:\n\n%s'%change["url"]
  except ValueError:
    pass

