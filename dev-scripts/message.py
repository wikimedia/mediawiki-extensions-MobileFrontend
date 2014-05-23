#!/usr/bin/python
import json
import sys

json_file = open( 'i18n/en.json' )
json_object_en = json.loads(json_file.read())
json_file.close()
json_file = open( 'i18n/qqq.json' )
json_object_qqq = json.loads(json_file.read())
json_file.close()

key = raw_input("Choose a message key e.g. `mobile-frontend-xxx`:\n")
if not key:
    print "A key must be provided"
    sys.exit(1)
else:
    if key in json_object_en:
        print "Existing message is:"
        print "\t`%s`\n" % json_object_en[key]
    else:
        print "Creating new message with key `%s`"%key

    msg = raw_input("What is the message in English?:\n")

    if not msg:
        if key in json_object_en:
            print "Message will remain unchanged."
        else:
            print "A message for the new key must be provided"
            sys.exit(1)

    if key in json_object_qqq:
        print "Existing message is:"
        print "\t`%s`\n" % json_object_qqq[key]

    prompt = "What is the description for this message (qqq)?\n"
    qqq = raw_input(prompt)
    if not qqq:
        if key in json_object_qqq:
            print "Message will remain unchanged."
        else:
            print "A message for the qqq code must be provided"
            sys.exit(1)

    if msg:
        json_object_en[key] = msg
    if qqq:
        json_object_qqq[key] = qqq
    save_needed = True

    print "Saving English message..."
    json_file = open( 'i18n/en.json', 'w' )
    json_file.writelines(json.dumps(json_object_en, sort_keys=True, indent=4, separators=(',',': ')))
    json_file.writelines('\n')
    json_file.close()

    print "Saving qqq message..."
    json_file = open( 'i18n/qqq.json', 'w' )
    json_file.writelines(json.dumps(json_object_qqq, sort_keys=True, indent=4, separators=(',',': ')))
    json_file.writelines('\n')
    json_file.close()

    print "Done!"
