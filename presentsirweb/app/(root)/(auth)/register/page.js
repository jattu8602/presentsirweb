export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Register Your Institution
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the form below to register your school, college, or
            coaching center
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <form className="space-y-6" action="#">
            {/* Institution Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative border rounded-lg p-4 flex flex-col items-center hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="institutionType"
                    id="school"
                    value="SCHOOL"
                    className="sr-only"
                    defaultChecked
                  />
                  <label
                    htmlFor="school"
                    className="cursor-pointer text-center"
                  >
                    <div className="text-blue-600 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">School</span>
                  </label>
                </div>
                <div className="relative border rounded-lg p-4 flex flex-col items-center hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="institutionType"
                    id="college"
                    value="COLLEGE"
                    className="sr-only"
                  />
                  <label
                    htmlFor="college"
                    className="cursor-pointer text-center"
                  >
                    <div className="text-indigo-600 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">College</span>
                  </label>
                </div>
                <div className="relative border rounded-lg p-4 flex flex-col items-center hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="institutionType"
                    id="coaching"
                    value="COACHING"
                    className="sr-only"
                  />
                  <label
                    htmlFor="coaching"
                    className="cursor-pointer text-center"
                  >
                    <div className="text-purple-600 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 mx-auto"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Coaching Center</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Institution Details */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="registeredName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Institution Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="registeredName"
                    id="registeredName"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter your institution name"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="registrationNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Registration Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="registrationNumber"
                    id="registrationNumber"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter registration number"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label
                  htmlFor="streetAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="streetAddress"
                    id="streetAddress"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter street address"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="city"
                    id="city"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700"
                >
                  District
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="district"
                    id="district"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter district"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="state"
                    id="state"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pincode
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="pincode"
                    id="pincode"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </div>

              {/* Principal Details */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="principalName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Principal/Director Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="principalName"
                    id="principalName"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter principal name"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="principalPhone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Principal/Director Phone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    name="principalPhone"
                    id="principalPhone"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter principal phone"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subscription Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Select a Subscription Plan
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    id="basic"
                    value="BASIC"
                    className="sr-only"
                    defaultChecked
                  />
                  <label htmlFor="basic" className="cursor-pointer">
                    <div className="font-medium text-lg">Basic</div>
                    <div className="text-2xl font-bold my-2">
                      ₹999
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      For small institutions
                    </p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Up to 200 students
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Basic features
                      </li>
                    </ul>
                  </label>
                </div>

                <div className="relative border rounded-lg p-4 hover:border-blue-500 cursor-pointer border-blue-500 ring-2 ring-blue-500">
                  <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-blue-500 text-white text-xs py-1 px-2 rounded-full">
                    Popular
                  </div>
                  <input
                    type="radio"
                    name="planType"
                    id="standard"
                    value="STANDARD"
                    className="sr-only"
                  />
                  <label htmlFor="standard" className="cursor-pointer">
                    <div className="font-medium text-lg">Standard</div>
                    <div className="text-2xl font-bold my-2">
                      ₹1,999
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      For medium institutions
                    </p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Up to 500 students
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        All basic features
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Advanced reporting
                      </li>
                    </ul>
                  </label>
                </div>

                <div className="relative border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    id="premium"
                    value="PREMIUM"
                    className="sr-only"
                  />
                  <label htmlFor="premium" className="cursor-pointer">
                    <div className="font-medium text-lg">Premium</div>
                    <div className="text-2xl font-bold my-2">
                      ₹3,999
                      <span className="text-sm font-normal text-gray-500">
                        /month
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      For large institutions
                    </p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Unlimited students
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        All standard features
                      </li>
                      <li className="flex items-center">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Priority support
                      </li>
                    </ul>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center mt-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  {' '}
                  Terms of Service{' '}
                </a>
                and
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  {' '}
                  Privacy Policy
                </a>
              </label>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <a
                  href="/auth"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </a>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Register
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
