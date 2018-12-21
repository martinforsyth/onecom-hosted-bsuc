//**************************************************************************
// date objects ...
// https://developers.google.com/google-ads/scripts/docs/features/dates

// https://www.w3schools.com/jsref/jsref_obj_date.asp
// https://www.w3schools.com/js/js_date_methods.asp
// https://www.w3schools.com/js/js_dates.asp

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

//**************************************************************************
// functions in js ...
// https://www.w3schools.com/js/js_function_invocation.asp

//**************************************************************************
// writing to documents ...
// https://developers.google.com/apps-script/reference/document/
// https://developers.google.com/apps-script/guides/docs

//**************************************************************************
// improvements ...
// let user choose start/end dates - see http://www.googleappsscript.org/miscellaneous/date-picker-2
// let user choose to have file emailed to them
// let user choose formatting options
// let user choose whether to include/exclude event descriptions

//**************************************************************************
// which calendar to operate on ...
// look for code of the form ...
// var aEvents = CalendarApp.getDefaultCalendar().getEvents(myODateStart, myODateEnd);

// globals
var gODateStart           = new Date();
var gODateEnd             = new Date();
var gStrFileName          = "calendarevents";
var gAMonths              = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var gADays                = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var gOIncludeEventDetails = new Boolean(false);
//var gStrFileFormat        = "with_headings";
var gStrFileFormat        = "without_headings";
var gStrDocURL            = "unitialised";
var gStrTargetFolderName  = "sharedbylink";

// functions
function setGlobalStartAndEndDateObjsWithHardcodedRule(mygODateStart, mygODateEnd)
{
  var ODateNow   = new Date();
  var iDayNow    = ODateNow.getDay(); // 0=sun,1=mon,2=tue,etc

  Logger.log("Month now is:     " + gAMonths[ODateNow.getMonth()] + "\n");
  Logger.log("Day now is:       " + gADays[ODateNow.getDay()]     + "\n");
  Logger.log("GetTime() now is: " + ODateNow.getTime()            + "\n"); // though see details about getTime() and common misunderstanding of
                                                                        // date object .. https://developers.google.com/google-ads/scripts/docs/features/dates
  //var formattedDate = Utilities.formatDate(ODateNow, "GMT", "dd:MM HH:mm");
  //Logger.log(formattedDate);
  Logger.log(ODateNow.toDateString());

  // set date start to the sunday following date now
  // set date end to the sunday following date start
  // 0=sun,1=mon,2=tue,etc
  if (0 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 7);
    mygODateEnd.setDate(ODateNow.getDate() + 14);
    Logger.log("aaa\n");
  } else if (1 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 6);
    mygODateEnd.setDate(ODateNow.getDate() + 13);
    Logger.log("bbb\n");
  } else if (2 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 5);
    mygODateEnd.setDate(ODateNow.getDate() + 12);
    Logger.log("ccc\n");
  } else if (3 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 4);
    mygODateEnd.setDate(ODateNow.getDate() + 11);
    Logger.log("ddd\n");
  } else if (4 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 3);
    mygODateEnd.setDate(ODateNow.getDate() + 10);
    Logger.log("eee\n");
  } else if (5 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 2);
    mygODateEnd.setDate(ODateNow.getDate() + 9);
    Logger.log("fff\n");
  } else if (6 == iDayNow){
    mygODateStart.setDate(ODateNow.getDate() + 1);
    mygODateEnd.setDate(ODateNow.getDate() + 8);
    Logger.log("ggg\n");
  } else {
    // something gone wrong
  }

  // set hours, mins, secs of start/end dates to capture events at any times on those days
  mygODateStart.setHours(0);
  mygODateStart.setMinutes(0);
  mygODateEnd.setHours(23);
  mygODateEnd.setMinutes(59);

  // read somewhere that toDateString() uses timezone that browser is set to by default
  // so code doesn't have to fiddle with adjustments such as "GMT" and "GMT + 1"
  Logger.log("Day now is: " + gADays[ODateNow.getDay()] + "\n");
  Logger.log("Day now is: " + ODateNow.toDateString() + "\n");

  Logger.log("GetTime() now is:   " + ODateNow.getTime()     + "\n");  // though see details about getTime() and common misunderstanding of
                                                                      // date object .. https://developers.google.com/google-ads/scripts/docs/features/dates
  Logger.log("GetTime() start is: " + mygODateStart.getTime() + "\n");  // though see details about getTime() and common misunderstanding of
                                                                      // date object .. https://developers.google.com/google-ads/scripts/docs/features/dates
  Logger.log("GetTime() end is:   " + mygODateEnd.getTime()   + "\n");  // though see details about getTime() and common misunderstanding of
                                                                      // date object .. https://developers.google.com/google-ads/scripts/docs/features/dates

}

// delete any pre-existing files with given name from google drive
function deleteFilesByName(mygStrFileName)
{
  var files = DriveApp.getFilesByName(mygStrFileName);
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }
}

function writeEventsToFile(myStrFileName, myODateStart, myODateEnd, gOIncludeEventDetails, gStrFileFormat)
{
  // treat id of document and id of file as the same thing - to provide link between document and file object API's
  //
  // delete any pre-existing documents called gStrFileName
  deleteFilesByName(myStrFileName);

  // Create and open a document in folder 'gStrTargetFolderName', so that all with link can see it.
  var doc                = DocumentApp.create(myStrFileName); // https://developers.google.com/apps-script/reference/document/
  var strFileAndDocID    = doc.getId();
  var myMatchedFolders   = DriveApp.getFoldersByName(gStrTargetFolderName); // only expect there to be one
  //var targetFolder;
  while (myMatchedFolders.hasNext()) {
    var folder = myMatchedFolders.next();
    var targetFolder = folder.addFile(DriveApp.getFileById(strFileAndDocID));
  }

  //.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.EDIT); //https://developers.google.com/apps-script/reference/drive/file#setSharing(Access,Permission)



  var body = doc.getBody(); //https://developers.google.com/apps-script/reference/document/body

  Logger.log('Document URL: ' + doc.getUrl());
  gStrDocURL = doc.getUrl();

  // portrait or landscape? - https://productforums.google.com/forum/#!topic/docs/HuwBipQ6cBY
  // Rotate to landscape, A4 size
  // doc.getBody().setPageHeight(595.276).setPageWidth(841.89);
  // Rotate to portrait, A4 size
  // doc.getBody().setPageHeight(841.89).setPageWidth(595.276);

  // set to portrait mode ...
  body.setPageHeight(841.89).setPageWidth(595.276);


  // This is where the target calendar is selected
  // use getDefaultCalendar() for default. Any other, use one of the GetCalendar**() functions at
  // https://developers.google.com/apps-script/reference/calendar/calendar-app
  //

  // Either ...
  // Use default calendar
  // var aEvents = CalendarApp.getDefaultCalendar().getEvents(myODateStart, myODateEnd);

  // Or ...
  // Use specificly identified, non-default calendar.
  // Use same calender as is embedded in website. Get it's id from calendar settings. Currently named
  // 'publicly visible calendar for everything' but that mighht change as it's a bit long!
  var aEvents = CalendarApp.getCalendarById('b8l05fgnou2004p3rhfvjjlurg@group.calendar.google.com').getEvents(myODateStart, myODateEnd);

  Logger.log('Number of events: ' + aEvents.length);

  // iterate through events, noting day, title and description of each
  if (1 <= aEvents.length)
  {
    var index        = 0;
    var strTargetDay = aEvents[index].getStartTime().toDateString();

    Logger.log(strTargetDay);

    var oElementParagraph = body.appendParagraph(strTargetDay); // https://developers.google.com/apps-script/reference/document/paragraph

    // apply formatting
    if ("with_headings" == gStrFileFormat)
    {
      oElementParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    }
    else if ("without_headings" == gStrFileFormat)
    {
      oElementParagraph.setFontSize(10);
      oElementParagraph.setBold(true);
    } // END apply formatting

    while(index < aEvents.length)
    {
      if (aEvents[index].getStartTime().toDateString() != strTargetDay)
      {
        strTargetDay = aEvents[index].getStartTime().toDateString();
        Logger.log(strTargetDay);
        //Element = body.appendParagraph(""); // create empty newline
        oElementParagraph = body.appendParagraph(strTargetDay);

        // apply formatting
        if ("with_headings" == gStrFileFormat)
        {
          oElementParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING3);
        }
        else if ("without_headings" == gStrFileFormat)
        {
          oElementParagraph.setFontSize(10);
          oElementParagraph.setBold(true);
        } // END apply formatting

      }

      // event title - with/without start time as appropriate
      if (true == aEvents[index].isAllDayEvent())
      {
        Logger.log(aEvents[index].getTitle());
        oElementParagraph = body.appendParagraph(aEvents[index].getTitle());
      }
      else
      {
        Logger.log(aEvents[index].getStartTime().getHours() + ":" + + aEvents[index].getStartTime().getMinutes() + " " + aEvents[index].getTitle());
        oElementParagraph = body.appendParagraph(aEvents[index].getStartTime().getHours() + ":" + + aEvents[index].getStartTime().getMinutes() + " " + aEvents[index].getTitle());
      }

      // apply formatting
      if ("with_headings" == gStrFileFormat)
      {
        oElementParagraph.setHeading(DocumentApp.ParagraphHeading.HEADING4);
      }
      else if ("without_headings" == gStrFileFormat)
      {
        oElementParagraph.setFontSize(10);
        oElementParagraph.setBold(false);
        oElementParagraph.setItalic(true);
      } // END apply formatting

      // event description
      if (gOIncludeEventDetails)
      {
        Logger.log(aEvents[index].getDescription());
        if ("" == aEvents[index].getDescription())
        {
          oElementParagraph = body.appendParagraph(""); // this effectively inserts a newline - i think
        }
        else
        {
          oElementParagraph = body.appendParagraph(aEvents[index].getDescription() + "\n");
        }

        // apply formatting
        if ("with_headings" == gStrFileFormat)
        {
          oElementParagraph.setFontSize(8);
          oElementParagraph.setBold(false);
          oElementParagraph.setItalic(false);
        }
        else if ("without_headings" == gStrFileFormat)
        {
          oElementParagraph.setFontSize(8);
          oElementParagraph.setBold(false);
          oElementParagraph.setItalic(false);
        } // END apply formatting

      } // END IF include event details

      index++;
    }
  }
  else
  {
    Logger.log("no events in date range");
  }

 return;
}



// Do the work
function myMain(myOStartEndDates)
{
  //return HtmlService.createTemplateFromFile('index').evaluate().setSandboxMode(HtmlService.SandboxMode.NATIVE);

  //setGlobalStartAndEndDateObjsWithHardcodedRule(gODateStart, gODateEnd);
  setGlobalStartAndEndDateObjsWithUserGenerateRange(gODateStart, gODateEnd, myOStartEndDates);

  Logger.log("Day xxxxxxxxx end is:   " + gADays[gODateEnd.getDay()]   + " = " + gODateEnd.toDateString()   + "\n");
  Logger.log("Day xxxxxxxxx end is:   " + gADays[gODateEnd.getDay()]   + " = " + gODateEnd.toDateString()   + "\n");

  Logger.log("Day xxxxxxxxx start is: " + gADays[gODateStart.getDay()] + " = " + gODateStart.toDateString() + "\n");
  Logger.log("Day xxxxxxxxxx end is:   " + gADays[gODateEnd.getDay()]   + " = " + gODateEnd.toDateString()   + "\n");

  //find all events in range, write details to document
  //writeEventsToFileFormattedFontSizes(gStrFileName, gODateStart, gODateEnd, gOIncludeEventDetails);
  //writeEventsToFileFormattedWithHeadings(gStrFileName, gODateStart, gODateEnd, gOIncludeEventDetails);
  writeEventsToFile(gStrFileName, gODateStart, gODateEnd, gOIncludeEventDetails, gStrFileFormat);

  return;
}

// https://www.w3schools.com/js/js_dates.asp
function SetStartEndDateObjects(myOStartEndDates, myStrDateRange)
{
  // 012345678901234567890123456789
  // 13/12/2108 to 14/12/2018

  myOStartEndDates['startDay']   = myStrDateRange.substring(0,2); // start (incl), end (excl)
  myOStartEndDates['startMonth'] = myStrDateRange.substring(3,5);
  myOStartEndDates['startYear']  = myStrDateRange.substring(6,10);
  myOStartEndDates['endDay']     = myStrDateRange.substring(14,16);
  myOStartEndDates['endMonth']   = myStrDateRange.substring(17,19);
  myOStartEndDates['endYear']    = myStrDateRange.substring(20,24);

  return;
}

function setGlobalStartAndEndDateObjsWithUserGenerateRange(mygODateStart, mygODateEnd, myOStartEndDates)
{
  // https://www.w3schools.com/jsref/jsref_setfullyear.asp (days are 1-31, months are 0-11)
  mygODateStart.setFullYear(myOStartEndDates['startYear'], myOStartEndDates['startMonth'] - 1, myOStartEndDates['startDay']);
  mygODateEnd.setFullYear(myOStartEndDates['endYear'], myOStartEndDates['endMonth'] - 1, myOStartEndDates['endDay']);

  // Adjust hours/mins to include all of start/end days. Without this, hours and mins will be set to values matching
  // the time at which new Date was called.
  mygODateStart.setHours(0); // 0-23
  mygODateStart.setMinutes(0);  // 0-59
  mygODateEnd.setHours(23);
  mygODateEnd.setMinutes(59);

  return;
}

// for deployment as web app, see https://developers.google.com/apps-script/guides/web
// called via ... https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?datestart=23122018&dateend=456
// called via ... https://script.google.com/macros/s/AKfycbzti4_uUaGNWAub1_HA6bhQTtMttU8wuVWl6X70oJm5sLUl8yg/exec?daterange=14/11/2018 - 17/11/2018'

// With regards to deployed webapp permissions, see ...
// https://stackoverflow.com/questions/28646165/posting-data-to-google-apps-script-using-php-curl ...
// Your Deployment setting for Who has access to the app: must be Anyone, Even Anonymous unless
// you want the code to only run if the user is signed into a Google account. Setting it to just
// Anonymous does not mean that it doesn't require the user to be logged in.
function doGet(e)
{

  var key = "AIzaSyAfPmFgRFKwVwKLTX_v6n5oSlRqVoxxbJ8"; // https://console.cloud.google.com/apis/credentials?project=project-id-7952616239316628927

  var strDateRange = e.parameter.daterange;
  var oStartEndDates = new Object;
  SetStartEndDateObjects(oStartEndDates, strDateRange);

  // https://stackoverflow.com/questions/22123371/date-picker-in-htmlservice-google-apps-script

  myMain(oStartEndDates);

  var output = HtmlService.createHtmlOutput('<p>Processing finished.');
  output.append('<p>Events in date range: ' + strDateRange +' written to <a href="' + gStrDocURL + '">Document URL</a>');
  output.append('<p>Once opened, the document can be downloaded using <em>File -> Download as</em>');
  // 31/10/2018 to 30/11/2018

  output.append("<p>Arguments check");
  output.append("<p>Start date: " +  oStartEndDates['startDay'] + " " + oStartEndDates['startMonth'] + " " + oStartEndDates['startYear']);
  output.append("<p>End date:   " + oStartEndDates['endDay']    + " " + oStartEndDates['endMonth']   + " " + oStartEndDates['endYear']);
  //output.append('<p>Document containing events: <a href="' + gStrDocURL + '">Document URL</a> Once opened, document can be downloaded using <em>File -> Download as</em>');

  return output;
}

function myTest()
{
  var oStartEndDates = new Object;
  SetStartEndDateObjects(oStartEndDates, "31/10/2018 to 30/11/2018");
  Logger.log("startYear:" + oStartEndDates['startYear'] +  " startMonth: " +  oStartEndDates['startMonth'] +  " startDay:" +  oStartEndDates['startDay']);
  Logger.log("endYear:" + oStartEndDates['endYear'] +  " endMonth: " +  oStartEndDates['endMonth'] +  " endDay:" +  oStartEndDates['endDay']);

  return;
}

//#####################################
/*
function doGet(request)
{
  var key = "AIzaSyBV5euqTkCVmS37KUotLzHhJ5KbFhQntNg"; // https://console.cloud.google.com/apis/credentials?project=project-id-7952616239316628927
  return HtmlService.createTemplateFromFile('Page')
      .evaluate();
}




function include(filename)
{
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}
*/

//#####################################



// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...
// unwanted stuff ...

function TestGetTime()
{
  var date1 = new Date();
  Utilities.sleep(500);  // ms. Here to establish that getTime() will return different values for date1 and date2
  var date2 = new Date();

  Logger.log("GetTime() date1 is:   " + date1.getTime() + "\n");
  Logger.log("GetTime() date2 is:   " + date2.getTime() + "\n");
  Logger.log(date1.getTime() == date2.getTime());

  return;
}



function myFunction() {
  var formattedDate = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
  Logger.log(formattedDate);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+1", "dd--'T'--HH:mm:ss--'Z'");
  Logger.log(formattedDate);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+1", "dd--HH:mm--'Z'");
  Logger.log(formattedDate);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+1", "dd HH:mm");
  Logger.log(formattedDate);
  var formattedDate = Utilities.formatDate(new Date(), "GMT+1", "dd:MM HH:mm");
  Logger.log(formattedDate);

  Logger.log(new Date().toISOString(), "%s\n");

  var startDate = new Date();
  var endDate = new Date();
  //Logger.log("%s +++ %s\n", startDate.day);


  // Determines how many events are happening today and contain the term "meeting".
  var today = new Date();
  var today = new Date(2018, 10, 21, 00, 00, 00, 00);

  var events = CalendarApp.getDefaultCalendar().getEventsForDay(today, {search: 'meeting'});
  Logger.log('Number of events: ' + events.length);

  var events = CalendarApp.getDefaultCalendar().getEventsForDay(today);
  Logger.log('Number of events: ' + events.length);

  var day = new Date(2018, 10, 20, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Sat 20 ' + events.length);


  var day = new Date(2018, 10, 21, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Sun 21 ' + events.length);

  var day = new Date(2018, 10, 22, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Mon ' + events.length);

  var day = new Date(2018, 10, 23, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Tue ' + events.length);

  var day = new Date(2018, 10, 24, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Wed ' + events.length);

  var day = new Date(2018, 10, 25, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Thu ' + events.length);

  var day = new Date(2018, 10, 26, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Fri ' + events.length);

  var day = new Date(2018, 10, 27, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Sat ' + events.length);

  var day = new Date(2018, 10, 28, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Sun ' + events.length);

  var day = new Date(2018, 10, 29, 00, 00, 00, 00);
  var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  Logger.log('Number of events:Mon ' + events.length);

  //var day = new Date(2018, 10, 30, 00, 00, 00, 00);
  //var events = CalendarApp.getDefaultCalendar().getEventsForDay(day);
  //Logger.log("Number of events:Tue %d \nxxx\n" + events.length);


}
