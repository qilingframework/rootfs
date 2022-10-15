function displayDstSwitchDates() {

    var firstSwitch = 0,
        secondSwitch = 0,
        lastOffset = 99,
        year = new Date().getYear();

    if (year < 1000) {
        year += 1900;
    }

    // Loop through every month of the current year 
    for (var i = 0; i < 12; i++) {
        // Fetch the timezone value for the month 
        var newDate = new Date(Date.UTC(year, i, 0, 0, 0, 0, 0)),
            zone = newDate.getTimezoneOffset() / -60;

        // Capture when a timzezone change occurs 
        if (zone > lastOffset) {
            firstSwitch = i - 1;
        } else if (zone < lastOffset) {
            secondSwitch = i - 1;
        }

        lastOffset = zone;
    }

    // Go figure out date/time occurences a minute before 
    // a DST adjustment occurs 
    var firstDstDate = findDstSwitchDate(year, firstSwitch),
        secondDstDate = findDstSwitchDate(year, secondSwitch);


    if (firstDstDate == null && secondDstDate == null) {
        return false;
    } else {
        return [firstDstDate, secondDstDate];
    }
}

function findDstSwitchDate(year, month) {
    // Set the starting date 
    var baseDate = new Date(Date.UTC(year, month, 0, 0, 0, 0, 0)),
        changeDay = 0,
        changeMinute = -1,
        baseOffset = baseDate.getTimezoneOffset() / -60;

    // Loop to find the exact day a timezone adjust occurs 
    for (day = 0; day < 50; day++) {
        var tmpDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0)),
            tmpOffset = tmpDate.getTimezoneOffset() / -60;

        // Check if the timezone changed from one day to the next 
        if (tmpOffset != baseOffset) {
            var minutes = 0;
            changeDay = day;

            // Back-up one day and grap the offset 
            tmpDate = new Date(Date.UTC(year, month, day - 1, 0, 0, 0, 0));
            tmpOffset = -1 * tmpDate.getTimezoneOffset() / 60;

            // Count the minutes until a timezone chnage occurs 
            while (changeMinute == -1) {
                tmpDate = new Date(Date.UTC(year, month, day - 1, 0, minutes, 0, 0));
                tmpOffset = -1 * tmpDate.getTimezoneOffset() / 60;

                // Determine the exact minute a timezone change 
                // occurs 
                if (tmpOffset != baseOffset) {
                    // Back-up a minute to get the date/time just 
                    // before a timezone change occurs 
                    tmpOffset = new Date(Date.UTC(year, month,
                        day - 1, 0, minutes - 1, 0, 0));
                    changeMinute = minutes;
                    break;
                } else
                    minutes++;
            }

            return Date.UTC(year, month, day - 1, 0, minutes - 1, 0, 0);
        }
    }
}
