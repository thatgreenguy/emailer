# Emailer

Configuration driven email with template substitution

Templates, configuration and transactional email data are stored in an Oracle database 
and are produced by various JDE programs/processes. 

This emailer application processes all outgoing email requests, respecting configuration setup 
and handling switching template tokens for actual data values.

Poll periodically and check for any email requirements, if found process each email 
request, pulling email template, and pluggable token values from JDE database. 
Once confirmed sent then update the JDE DB transaction file showing processed with date 
and time sent. If error then attempt to resend several times before giving up and 
recording error text and marking as processed leaving the sent date/time empty.

Oracle tables used:
- F559890     Template and email configuration  
- F55NB901    Outgoing email requests control and log file
- F55NB911    Outgoing email token data/value pairs and additional email data



