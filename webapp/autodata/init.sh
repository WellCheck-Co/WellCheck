if [ -z "${CRON_SCHEDULE}" ]; then
    echo -ne "Empty CRON_SCHEDULE variable\n"
    exit 1
fi

# variables crond
STDOUT_LOC=${STDOUT_LOC:-/home/autodata/log.suc}
STDERR_LOC=${STDERR_LOC:-/home/autodata/log.err}

# settings crond
echo -ne "# custom script for sending jokes\n${CRON_SCHEDULE} /usr/local/bin/python3 /home/autodata/adddata.py ${DB_USER} ${DB_PASS} > ${STDOUT_LOC} 2> ${STDERR_LOC}\n" | crontab -

# run cron
su -c "/usr/sbin/cron -f"
