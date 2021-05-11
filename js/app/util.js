
function Util() {}

Util.findItemFromList = function( listData, searchProperty, searchValue )
{
	var foundData;

	$.each( listData, function( i, item )
	{
		if ( item[ searchProperty ] == searchValue )
		{
			foundData = item;
			return false;
		}
	});

	return foundData;
};


Util.RemoveFromArray = function( list, propertyName, value )
{
	var index;

	$.each( list, function( i, item )
	{
		if ( item[ propertyName ] == value ) 
		{
			index = i;
			return false;
		}
	});

	if ( index !== undefined ) 
	{
		list.splice( index, 1 );
	}

	return list;
};