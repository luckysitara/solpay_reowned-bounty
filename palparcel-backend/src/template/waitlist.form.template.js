/**
 * @function messageTemplate
 * @param {vendor_name} string
 * @returns {string}
 */
const messageTemplate = (vendor_name) => `
<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>welcome to Palparcel Waitlist</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
        rel="stylesheet" />

    <style type="text/css">
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        .montserrat-font {
            font-family: "Montserrat", sans-serif;
            font-optical-sizing: auto;
            font-weight: 500;
            font-style: normal;
        }

        body {
            margin: 0;
            background: rgba(2, 199, 150, 0.1);
            font-family: "Montserrat", sans-serif;
        }

        table {
            border-spacing: 0;
        }

        #table-flex {
            display: flex;
            align-items: center !important;
            justify-content: space-between !important;
        }

        td {
            padding: 0;
        }

        img {
            border: 0;
        }

        a {
            text-decoration: none;
            color: #02c796;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background: rgba(2, 199, 150, 0.1);
            padding-top: 40px;
            padding-bottom: 60px;
        }

        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-spacing: 0;
            font-family: "Inter", sans-serif;
            color: #0a302b;
        }

        .button {
            cursor: pointer;
            outline: 0;
            border: 0;
            /* padding: 12px 15px; */
            /* width: 174px; */
            height: 44px;
            max-width: 505px;
            background: #7132A5;
            box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.1);
            border-radius: 99px;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            /* line-height: 27px; */
            color: #ffffff;
            padding: 13px 24px;
        }
    </style>
</head>

<body>
    <center class="wrapper">
        <table class="main" width="100%" style="
          padding-left: 50px;
          padding-right: 50px;
          padding-top: 20px;
          padding-bottom: 20px;
        ">
            <!-- header -> logo section -->
            <tr>
                <td style="padding: 28px 0 15px 0">
                    <table width="100%">
                        <tr>
                            <td>
                                <a href="https://waitlist-git-main-gideonodiokines-projects.vercel.app/"
                                    target="_blank">
                                    <img src="http://res.cloudinary.com/dnjfgvbig/image/upload/v1721047157/customers/xotoh2rplx7qtqo9cdkm.png"
                                        style="margin-bottom: 20px;" />
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- body section -->
            <tr>
                <td>
                    <table width="100%">
                        <tr>
                            <td>
                                <table width="100%">
                                    <tr>
                                        <td style="text-align: left">
                                            <h1 class="montserrat-font" style="
                            font-style: normal;
                            font-weight: 500;
                            font-size: 15px;
                            color: #001128;
                            /* line-height: 150%; */
                          ">
                                                Hi ${vendor_name},
                                            </h1>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%">
                                    <tr>
                                        <td style="text-align: left">
                                            <p class="montserrat-font" style="
                            padding: 16px 0px 19px;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 15px;
                            line-height: 200%;
                          ">
                                                We're thrilled to welcome you to Palparcel, the future
                                                of e-commerce!
                                            </p>
                                            <img
                                                src="https://slack-imgs.com/?c=1&o1=ro&url=https%3A%2F%2Fmedia.giphy.com%2Fmedia%2FBvE4n1kP0fhVNfA0Pf%2Fgiphy.gif" />
                                            <p class="montserrat-font" style="
                            padding: 16px 0px 19px;
                            font-style: normal;
                            font-weight: 400;
                            font-size: 15px;
                            line-height: 24px;
                            color: #001128;
                          ">
                                                As a vendor on our platform, you'll gain access to a
                                                multitude of benefits that will help you grow your
                                                business and reach new heights. Here's a taste of what
                                                awaits you:
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%">
                                    <tr>
                                        <td style="text-align: left; color: #001128">
                                            <ul style="
                            /* font-style: normal;
														font-weight: 700;
														font-size: 24px;
														line-height: 150%;
														margin-bottom: 7px; */
                            color: #001128;
                          ">
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="
                                font-style: normal;
                                font-size: 15px;
                                line-height: 24px;
                                margin-bottom: 7px;
                                font-weight: bold;
                              ">Massive Customer Base:</span>
                                                    <span style="font-size: 15px; font-weight: 400">you will tap into a
                                                        vast network of eager
                                                        customers looking for the best deals on a wide
                                                        variety of products.</span>
                                                </li>
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="
                                font-style: normal;
                                font-size: 15px;
                                line-height: 24px;

                                margin-bottom: 7px;
                                font-weight: bold;
                              ">Simplified Selling:</span>
                                                    <span style="font-size: 15px; font-weight: 400">Our user-friendly
                                                        platform makes managing your
                                                        inventory, orders, and payments a breeze.</span>
                                                </li>
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="
                                font-style: normal;
                                font-size: 15px;
                                line-height: 24px;

                                margin-bottom: 7px;
                                font-weight: bold;
                              ">Competitive Advantage:</span>
                                                    <span style="font-size: 15px; font-weight: 400">Palparcel's
                                                        innovative approach to e-commerce
                                                        will give you an edge over the competition.</span>
                                                </li>
                                                <li class="montserrat-font">
                                                    <span style="
                                font-style: normal;
                                font-size: 15px;
                                line-height: 24px;

                                margin-bottom: 4px;
                                font-weight: bold;
                              ">Timely Payments:</span>
                                                    <span style="font-size: 15px; font-weight: 400">Enjoy peace of mind
                                                        knowing you'll receive prompt
                                                        and reliable payments for your sales.
                                                    </span>
                                                </li>
                                            </ul>

                                            <h4 class="montserrat-font" style="
                            padding: 15px 0px;
                            font-style: normal;
                            font-weight: 500;
                            font-size: 15px;
                            line-height: 200%;
                          ">
                                                Join the Palparcel Vendor Community! ️
                                            </h4>
                                            <p class="montserrat-font" style="
                            font-style: normal;
                            font-weight: 400;
                            font-size: 14px;
                            line-height: 24px;
                            margin-bottom: 10px;
                          ">
                                                To stay connected, informed, and engaged with other
                                                Palparcel vendors, we highly recommend joining our
                                                exclusive Telegram community. This is a fantastic
                                                space to:
                                            </p>
                                            <ul style="
                            /* font-style: normal;
                                            														font-weight: 700;
                                            														font-size: 24px;
                                            														line-height: 150%;
                                            														margin-bottom: 7px; */
                            color: #001128;
                          ">
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="font-size: 14px; font-weight: 400">Network with fellow
                                                        vendors and share best
                                                        practices.</span>
                                                </li>
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="font-size: 14px; font-weight: 400">Get the latest
                                                        updates and announcements from
                                                        Palparcel.</span>
                                                </li>
                                                <li style="margin-bottom: 6px" class="montserrat-font">
                                                    <span style="font-size: 14px; font-weight: 400">Ask questions and
                                                        receive support from our
                                                        dedicated team.</span>
                                                </li>
                                            </ul>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%">
                                    <tr>
                                        <div style="
                                                margin: 10px 0px 23px;
                                                /* border-top: 1px solid #dadada; */
                                                " />
                                        <p class="montserrat-font" style="color: #001128;">TechGeneHQ Inc.</p>
                                    </tr>
                                     <div style="
                                                margin: 10px 0px 23px;
                                                /* border-top: 1px solid #dadada; */
                                                " />
                                     <tr>
                                       
                                        <td style="text-align: left;">
                                            <a href="https://t.me/+WlWr9ZnPbhE3ODM0" target="_blank">
                                                <button class="button montserrat-font">Join our telegram</button>
                                            </a>

                                        </td>
                                    </tr>
                                </table>
                                <!-- Footer -->
                                <table width="100%">
                                    <div style="
                                                                                                        margin: 10px 0px 23px;
                                                                                                        /* border-top: 1px solid #dadada; */
                                                                                                      " />
                                    <tr>
                                        <td style="text-align: center">
                                            <table width="100%">
                                                <tr>
                                                    <td style="
                                text-align: left;
                                margin: 20px;
                              ">
                                                        <!-- <p style="
                                  font-style: normal;
                                  font-weight: 600;
                                  font-size: 18px;
                                  line-height: 120%;
                                ">
                                                            Need Help?
                                                        </p> -->
                                                        <p class="montserrat-font" style="
                                  font-style: normal;
                                  font-weight: 400;
                                  font-size: 14px;
                                  line-height:24px;
                                  color: #969696;
                                ">
                                                            This email was sent from <a style="color: #7132A5;"
                                                                href="mailto:palparcelhq@gmail.com">palparcelhq@gmail.com.</a>
                                                            If you'd
                                                            rather not receive this kind of email, you can <span
                                                                style="color: #7132A5;">
                                                                unsubscribe
                                                            </span>
                                                            or
                                                            <span style="color: #7132A5;">
                                                                manage your email preferences.
                                                            </span>

                                                            We’re here to help you at any step along the
                                                            way.
                                                        </p>
                                                        <p style="margin-top: 30px; color: #969696; font-size: 14px; text-align: center;"
                                                            class="montserrat-font">© 2024
                                                            Palparcel</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center">
                                            <table width="100%">

                                                  <tr>
                                                    <div
                                                        style="
                                                            margin: 10px 0px 23px;
                                                            /* border-top: 1px solid #dadada; */
                                                            " />
                                                    <td>

                                                        <div>
                                                            <a href="https://www.instagram.com/techgenehq" target="_blank">
                                                                <img width="20px" style="margin: 12px"
                                                                    src="https://raw.githubusercontent.com/richardingwe/creditwave-emails/master/images/ig.png"
                                                                    alt="instagram" />
                                                            </a>
                                                            <a href="https://www.linkedin.com/company/techgenehq" target="_blank">
                                                                <img width="20px" style="margin: 12px"
                                                                    src="https://raw.githubusercontent.com/richardingwe/creditwave-emails/master/images/linkedin.png"
                                                                    alt="linkedin" />
                                                            </a>
                                                            <a href="https://www.facebook.com/techgenehq" target="_blank">
                                                                <img width="20px" style="margin: 12px"
                                                                    src="https://raw.githubusercontent.com/richardingwe/creditwave-emails/master/images/fb.png"
                                                                    alt="facebook" />
                                                            </a>
                                                            <a href="https://www.twitter.com/techgenehq" target="_blank">
                                                                <img width="20px" style="margin: 12px"
                                                                    src="https://raw.githubusercontent.com/richardingwe/creditwave-emails/master/images/twitter.png"
                                                                    alt="twitter" />
                                                            </a>
                                                        </div>

                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>

</html>

`;

module.exports = messageTemplate;
