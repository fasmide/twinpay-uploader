# twinpay-uploader

This simple example shows users how to import data into a Twinpay installation using a simple csv format.

The app can be used as is, or used to create an implementation into another system. It requires [Nodejs](http://nodejs.org/). Once downloaded, install dependencies with `npm install`.

# Usage

	$ node app.js --help

	  Usage: app.js [options]

	  Options:

	    -h, --help          output usage information
	    -V, --version       output the version number
	    -k, --key [value]   API key
	    -h, --host [value]  Hostname (e.g. dev.twinpay.eu)
	    -d, --dir [value]   Full path for update CSV's

# Example

	node app.js -k someKey -h dev.twinpay.eu -d /home/where/to/look/for/files

When the app runs it looks for files every 10 seconds. When it finds new CSV files it will import them into Twinpay and rename the csv file to end in `.finished` togeather with a timestamp.

# Post request

The server should receive a simple POST request with the file, and a field containing the specific installations API key. See `app.js` for reference.

## Raw example

The POST request is a standard form file upload request encoded with `multipart/form-data`.

### Request

	POST /api/import-csv HTTP/1.1
	Accept: */*
	Accept-Encoding: gzip, deflate, compress
	Content-Type: multipart/form-data; boundary=af936057ea424ce2adf092c47f5e3fc4
	Host: dev.twinpay.eu
	User-Agent: HTTPie/0.3.0

	--52056512ce9f43548b3c817de14e2ff4
	Content-Disposition: form-data; name="key"
	Content-Type: text/plain

	someProvidedApiKey
	--52056512ce9f43548b3c817de14e2ff4
	Content-Disposition: form-data; name="uploadedfile"; filename="somefilename.csv"
	Content-Type: text/csv

	DJF87SKF;2345234531;DJF87SKF;Anders Andersen;
	... stripped ...
	DJF87SKG;2342342345;DJF87SKG;Hans Petersen;

	--52056512ce9f43548b3c817de14e2ff4--

### Response

	HTTP/1.1 200 OK
	Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
	Content-Encoding: gzip
	Content-Length: 20
	Content-Type: text/html
	Date: Tue, 12 Nov 2013 21:47:30 GMT
	Expires: Thu, 19 Nov 1981 08:52:00 GMT
	Pragma: no-cache
	Vary: Accept-Encoding

# CSV Format

## Data fields

### cardno

This is what the user enters as 'username' when logging into their account. (This is typically printed directly on the card)

### verification

This is sort of a password, that is not written anywhere on the card. Also used when logging in.

### identifier
This is the data written to the card. (In case of RFID/NFC tags its their unique ID)

### extra1 and extra2
Used to make it easier to find people in the administration, typically extra1 is used for the cardholders name, but anything goes. (extra2 could be an id from a foreign database or what you see fit)

## Layout

`Cardno;Verification;Identifier;Extra1;Extra2`

`Extra1` and `Extra2` are optional.

The column header should not be included in the file.

## Requirements

* File must be semicolon separated (;)
* File must __not__ encapsulate columns (e.g. hello;world; not "hello";"world";)
* File must be `ISO-8859-1` encoded
* File must not contain the header (see layout above)

## The update is executed like this:

1. If a `cardno` is found that does not exist in the database, it will be created.
2. If a `cardno` does exist `verification`, `identifier`, `extra1` and `extra2` is updated
3. If a `cardno` is in the database but not in the file, it will be removed if the balance is zero (0.00)
