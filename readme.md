Base.js Extended - Supporting JavaScripts getters and setters
=============================================================

I was working with Base.js (by John Resig) for a while
and now I used it in Appcelerators Mobile Framework.
I realised they support setting the properties getters and setters.

I then found Johns post http://ejohn.org/blog/javascript-getters-and-setters/
where he describes the syntax and possible implementations when you want
to extend objects.

So I decided to mix it in Base.js

### Usage of BaseEx.js

First You should know how to use John Resigs Base.js, details here: http://ejohn.org/blog/simple-javascript-inheritance/

	var Person = Class.extend({
		init: function(options) {
			this.firstName = options.firstName;
			this.lastName = options.lastName;
		},
		get fullname() {
			return this.firstName + " " + this.lastName;
		},
		get message() {
			return "Person: " + this.fullname;
		}
	});

	var Employee = Person.extend({
		init: function(options) {
			this._super();
			this.department = options.department;
		},
		get message {
			return this._super() + " Department: " + this.department;
		}
	});

	var person = new Person({
		firstName : "Mike",
		lastName : "Miller
	});

	console.log(person.message);
	//--> Person: Mike Miller

	var employee = new Employee({
		firstName : "Mike",
		lastName: "Miller",
		department: "Sales"
	});

	console.log(employee.message);
	//--> Person: Mike Miller Department: Sales