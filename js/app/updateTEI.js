
function UpdateTEI()
{
    var me = this;


    // ------------------------------------------------------------------------
    // Variables


    me.curPage = 0;
    me.pageCount = 1;

    // For each page of SQLView
    me.setupPageNumber;
    me.processingIdx = 0;
    me.totalInPage = 0;


    me.ID_SQLVIEW = "VHjVEESMFtp"; 

    me.ID_PROGRAM = "A7SRy7lpk1x";
    me.ID_ATTRIBUTE_AGE = "JM9qqwDihBV";
    me.ID_ATTRIBUTE_BIRTHDATE = "wSp6Q7QDMsk";


    // ------------------------------------------------------------------------
    // URLs
    
    me.PARAM_TEI_ID = "@PARAM_TEI_ID";

    // Just load 50 first TEI for testing, UID will be changed when we upload this app on production server
    me.QUERY_URL_TEI_LIST = "../../../api/sqlViews/" + me.ID_SQLVIEW + "/data.json?page="; 
    me.QUERY_URL_TEI_INFO = "../../../api/trackedEntityInstances/" + me.PARAM_TEI_ID + ".json?program=" + me.ID_PROGRAM + "&fields=*,relationships";
    me.QUERY_URL_TEI_UPDATE = "../../../api/trackedEntityInstances/" + me.PARAM_TEI_ID + "?program=" + me.ID_PROGRAM;


    // ------------------------------------------------------------------------
    // HTML Element tags

    me.pageNumberTag = $("#pageNumber");
    me.updateTEIBtnTag = $("#updateTEIBtn");
    
    me.pageInfoDivTag = $("#pageInfoDiv");
    me.currentPageDivTag = $("#currentPageDiv");

    me.processingDivTag = $("#processingDiv");

    


    // ------------------------------------------------------------------------
    // Init method

    me.init = function()
    {
        me.setup_Events();
    }

    me.setup_Events = function()
    {
        me.updateTEIBtnTag.click( function(){
            me.processingDivTag.html("");
            me.pageInfoDivTag.html("");
            me.curPage = 0;
            me.pageCount = 1;
            me.setupPageNumber = undefined;
            me.processingIdx = 0;
            me.totalInPage = 0;

            var pageNumber = me.pageNumberTag.val();
            if( pageNumber == "" )
            {
                me.setupPageNumber = undefined;
                me.loadAndUpdateTEIList();
            } 
            else if( me.isPositiveInteger( pageNumber ) )
            {
                me.setupPageNumber = eval( pageNumber );
                me.loadAndUpdateTEIList();
            }
            else
            {
                me.processingDivTag.html("<p> The number of page should be a postive integer Or keep it empty.</p>");
            }
           
        });
    }

    
    
    // ------------------------------------------------------------------------
    // Load TEI List

    me.isPositiveInteger = function(str) {
        var n = Math.floor(Number(str));
        return n !== Infinity && String(n) === str && n > 0;
    }

    me.loadAndUpdateTEIList = function()
    {

        if( ( me.setupPageNumber != undefined && me.curPage < me.setupPageNumber ) 
           || ( me.setupPageNumber == undefined && me.curPage < me.pageCount ) )
        {
            me.curPage++;
            me.processingDivTag.append("<p style='font-weight:bold;'> Loading TEI list in page " + me.curPage + " ... </p>");
            me.currentPageDivTag.html( "Running page : " + me.curPage );

            $.ajax(
            {
                type: "GET"
                ,url: me.QUERY_URL_TEI_LIST + me.curPage
                ,contentType: "application/json;charset=utf-8" ,beforeSend: function( xhr ) 
                {
                    me.processingDivTag.append("<p Loading TEI list in page " + me.curPage + " ... </p>");
                }
                ,success: function( response ) 
                {		
                    me.pageCount = response.pager.pageCount;
                    me.pageInfoDivTag.html("");
                    me.pageInfoDivTag.append("<p>Total of pages : " + response.pager.pageCount + "</p" );
                    me.pageInfoDivTag.append("<p>Total of clients : " + response.pager.total + "</p" );
                    if( me.setupPageNumber != undefined && me.setupPageNumber > me.pageCount )
                    {
                        me.setupPageNumber = me.pageCount;
                    }

                    me.updateTEIList( response.listGrid.rows );
                }
                ,error: function( )
                {
                    me.processingDivTag.find("p[teiId='" + teiData.id + "']").append("FAILED");
                }
            });
        }
        else
        {
            me.currentPageDivTag.html( "Running page : " + me.curPage + " ... DONE" );
            me.processingDivTag.append("<p>ALL TEI ARE UPDATED !</p>");
        }
       

    }

    // ------------------------------------------------------------------------
    // Update TEI attribute

    me.updateTEIList = function( teiList )
    {
        me.processingIdx = 0;
        me.totalInPage = teiList.length;

        for( var i in teiList )
        {
            var teiId = teiList[i][0];
            me.retrieveAndUpdateTeiInfo( teiId );
        }

    }

    me.retrieveAndUpdateTeiInfo = function( teiId )
    {
        var url = me.QUERY_URL_TEI_INFO;
        url = url.replace( me.PARAM_TEI_ID, teiId );

        $.ajax(
            {
                type: "GET"
                ,url: url
                ,contentType: "application/json;charset=utf-8"
                ,beforeSend: function( xhr ) 
                {
                    me.processingDivTag.append("<p teiId='" + teiId + "'>Updateing TEI: " + teiId + " ... </p>");
                }
                ,success: function( response ) 
                {		
                    me.updateTEIInfo( response );
                }
                ,error: function( )
                {
                    me.processingDivTag.find("p[teiId='" + teiId + "']").append("FAILED");
                }
            });
    }

    me.updateTEIInfo = function( teiData )
    {
        var url = me.QUERY_URL_TEI_UPDATE;
        url = url.replace( me.PARAM_TEI_ID, teiData.trackedEntityInstance );

        var jsonData = me.addBirthdateAttrValue( teiData );

        $.ajax(
        {
            type: "PUT"
            ,url: url
            ,dataType: "json"
            ,data: JSON.stringify( jsonData )
            ,contentType: "application/json;charset=UTF-8"
            ,success: function( msg ) 
            {
                me.processingDivTag.find("p[teiId='" + teiData.trackedEntityInstance + "']").append("SUCCESS");
                me.processingIdx++;
                me.afterUpdateTEIList();
            }
            ,error: function( msg ) 
            {
                me.processingDivTag.find("p[teiId='" + teiData.trackedEntityInstance + "']").append("FAILED");
                me.processingIdx++;
                me.afterUpdateTEIList();
            }	
        });
    }

    me.afterUpdateTEIList = function()
    {
        if( me.processingIdx == me.totalInPage )
        {
            me.loadAndUpdateTEIList();
        }
    }


    me.addBirthdateAttrValue = function( teiData )
    {
        var attributes = teiData.attributes;
        var ageAttrValue = Util.findItemFromList( attributes, "attribute", me.ID_ATTRIBUTE_AGE );
        var age = eval( ageAttrValue.value );

        var createdDate = teiData.created;
        var year = eval( createdDate.split("-")[0] );

        var birthYear = year - age;
        var birthDate = birthYear + "-01-01";
        

        attributes.push({
            "attribute": me.ID_ATTRIBUTE_BIRTHDATE,
            "value": birthDate
        });

        return teiData;
    }


    // ------------------------------------------------------------------------
    // RUN init

    me.init();
}