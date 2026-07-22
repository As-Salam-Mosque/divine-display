# Divine Display Terms of Service

**Last Updated: July 16, 2026**

## About this document

Divine Display is open-source software (see [LICENSE](LICENSE)): a prayer-time display screen (this repository, [`divine-display`](https://github.com/As-Salam-Mosque/divine-display)) that mosques and Islamic centers can self-host or subscribe to in order to manage their own display.

These Terms of Service ("Terms") govern this specific hosted instance of Divine Display — the website you are currently on, where mosques can register for a display and businesses can partner as sponsors.

Throughout this document, "we," "our," and "us" refer to **Divine Display**, and "the Service" refers to this website, the prayer-time display it produces, and its administration dashboard. "You" refers to anyone who views the display, holds a mosque administrator account, or inquires as a business partner.

These Terms apply to your access and use of the Service. Please read them carefully. They should be read together with our [Privacy Policy](PRIVACY.md), which explains what data we collect and how we use it, and our [Ad Policy](AD_POLICY.md), which explains what sponsors we accept.

## Accepting these Terms

If you access or use the Service, it means you agree to be bound by all of the terms below. So, before you use the Service, please read all of the terms. If you don't agree to all of the terms below, please do not use the Service. If a term does not make sense to you, please let us know by e-mailing **divine-display@snake.mozmail.com**.

The Service has two audiences with different obligations under these Terms:

1. **Viewers** — people who look at the prayer-time display (e.g. on a screen in a mosque). Viewers do not create an account; by viewing the display you agree to the limited terms that apply to viewers (see [Your Content & Conduct](#your-content--conduct) and [Unavoidable Legal Stuff](#unavoidable-legal-stuff)).
2. **Mosque administrators** — the person or team who registers an account with the backend API to configure a display (mosque details, sponsors, announcements, etc.). Administrators agree to all sections of these Terms, including [Creating Accounts](#creating-accounts).

## Changes to these Terms

We reserve the right to modify these Terms at any time — for instance, if we add a new feature or need to reflect a change in how the Service operates.

Whenever we make changes to these Terms, the changes are effective 30 days after we post the revised Terms (indicated by revising the "Last Updated" date above) or upon your acceptance if we provide a mechanism for immediate acceptance (such as a click-through confirmation in the admin dashboard). It is your responsibility to check the Service for changes to these Terms.

If you continue to use the Service after the revised Terms go into effect, you have accepted the changes.

## Privacy Policy

For information about how we collect and use information about users of the Service, please see our [Privacy Policy](PRIVACY.md).

## Third-Party Services

The Service relies on third-party providers to operate, including a prayer-time calculation API ([AlAdhan API](https://aladhan.com/prayer-times-api)), a font provider (Google Fonts), and hosting/database infrastructure. See the Privacy Policy's [Third-Party Services](PRIVACY.md#third-party-services) section for the current list.

We may also provide links to third-party websites (e.g. a mosque's public website, or a sponsor's website via the ad rail) that we do not own or control. Your use of any such third-party site or service is governed by that party's own terms and privacy policy. We encourage you to review them.

## Creating Accounts

Mosque administrator accounts are created by registering a `slug` (a short identifier for the mosque, used in the display URL) and a password with the backend API. When you create an account, you agree to:

- Maintain the security of your password and accept all risks of unauthorized access to any data or configuration you provide to the Service.
- Provide accurate information about the mosque or organization you represent in the configuration you submit (name, location, contact details, prayer calculation settings, etc.).
- Be authorized to act on behalf of the mosque or organization whose configuration you are creating or editing.

If you discover or suspect any security breach affecting your account or the Service, please let us know as soon as possible at **divine-display@snake.mozmail.com**.

Only the authenticated administrator (via a valid bearer session token) can update that mosque's password or configuration. Session tokens expire automatically; see the Privacy Policy for details.

## Your Content & Conduct

Our Service allows mosque administrators to submit configuration content that is displayed publicly on the screen, including the mosque's name, location, contact details, logo, sponsor/advertisement images and links, and announcement text ("Content").

You are responsible for the Content you submit, including its legality, reliability, and appropriateness. When you submit Content to the Service, you grant us the right and license to store, reproduce, format, and publicly display that Content through the Service, for the purpose of operating the display. We will not edit or revise the substance of your Content. Aside from this limited right, you retain all of your rights to the Content you submit.

You can remove Content you submitted by editing or deleting it through the administration dashboard. Once removed, it will not appear on the display, but copies may remain in backups for some period of time as described in the Privacy Policy.

Sponsor and advertisement content submitted to the Service must also comply with our [Ad Policy](AD_POLICY.md).

You may not submit Content, and viewers/administrators may not otherwise use the Service to publish or transmit, any of the following:

- Content that is libelous, defamatory, bigoted, fraudulent, or deceptive;
- Content that is illegal or unlawful, or that would otherwise create liability for us;
- Content that infringes or violates any patent, trademark, trade secret, copyright, right of privacy, right of publicity, or other right of any party;
- Sponsor/advertisement content unrelated to a legitimate sponsor relationship, or content that misrepresents a sponsor's affiliation with a mosque;
- Private information of any third party (e.g., home addresses, personal phone numbers, email addresses, or financial information) beyond what is needed for the mosque's own public contact details;
- Viruses, malicious scripts, corrupted data, or other harmful, disruptive, or destructive files or code (e.g., in an image URL or link field).

You also agree that you will not:

- Use the Service in any manner that could interfere with, disrupt, negatively affect, or inhibit other administrators or viewers from using the Service, or that could damage, disable, overburden, or impair the Service (including the backend API or database);
- Impersonate or configure a display on behalf of any mosque or organization you are not authorized to represent;
- Attempt to access, modify, or delete another mosque's account or configuration without authorization;
- Create an account or submit Content if you are not over 18 years of age;
- Circumvent or attempt to circumvent any authentication, rate limits, or other security measures designed to protect the Service or its users.

## Divine Display Software

Copying, modifying, and redistributing the Divine Display source code itself is governed by the [LICENSE](LICENSE) (MPL-2.0), not by these Terms.

These Terms instead govern your use of **this specific hosted instance of the Service**, which the LICENSE does not cover. Unless we expressly state otherwise, your rights as a user of our hosted instance do not include: (i) publicly performing or publicly displaying content served by our instance outside of viewing the display as intended; (ii) using any data-mining, robots, or similar automated data-gathering methods against our instance; (iii) downloading (other than ordinary page caching) any portion of our instance beyond what is necessary to view the display or manage your own mosque's configuration; or (iv) using our hosted instance other than for its intended purpose of operating a prayer-time display. If you do any of this, we may suspend or terminate your access to our instance — this does not affect your rights under the LICENSE with respect to the underlying source code.

Our name and any branding shown on this website are owned by us and are not covered by the LICENSE.

## Hyperlinks and Third-Party Content

You may create a hyperlink to the Service. You may not use, frame, or otherwise enclose our trademarks, logos, or other proprietary information without our express written consent.

We make no claim or representation regarding, and accept no responsibility for, third-party websites accessible by hyperlink from the Service (including sponsor websites linked from the ad rail) or websites linking to the Service. When you leave the Service, these Terms and our policies no longer govern.

Configuration content (mosque details, sponsor information, announcements) is provided by mosque administrators and is not independently verified, authenticated, or fact-checked by us. We make no representations, warranties, or guarantees relating to the accuracy or completeness of any Content, including prayer times calculated by the third-party AlAdhan API. You acknowledge sole responsibility for, and assume all risk arising from, your use of or reliance on any Content displayed through the Service — in particular, prayer and iqamah times shown on the display are provided for convenience and should not be treated as an authoritative religious ruling.

## Unavoidable Legal Stuff

THE SERVICE AND ANY CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE THROUGH THE SERVICE ARE PROVIDED ON AN "AS IS" OR "AS AVAILABLE" BASIS WITHOUT ANY REPRESENTATIONS OR WARRANTIES OF ANY KIND. WE DISCLAIM ANY AND ALL WARRANTIES AND REPRESENTATIONS (EXPRESS OR IMPLIED, ORAL OR WRITTEN) WITH RESPECT TO THE SERVICE AND ITS CONTENT, WHETHER ALLEGED TO ARISE BY OPERATION OF LAW, BY REASON OF CUSTOM OR USAGE IN THE TRADE, BY COURSE OF DEALING, OR OTHERWISE.

IN NO EVENT WILL **DIVINE DISPLAY** BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY SPECIAL, INDIRECT, INCIDENTAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES OF ANY KIND ARISING OUT OF OR IN CONNECTION WITH THE SERVICE OR ANY CONTENT INCLUDED ON OR OTHERWISE MADE AVAILABLE THROUGH THE SERVICE, REGARDLESS OF THE FORM OF ACTION, WHETHER IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ALL CAUSES OF ACTION AND UNDER ALL THEORIES OF LIABILITY WILL BE LIMITED TO THE AMOUNT, IF ANY, YOU PAID TO **DIVINE DISPLAY** FOR USE OF THE SERVICE IN THE PRECEDING 12 MONTHS.

You agree to defend, indemnify, and hold us harmless from and against any and all costs, damages, liabilities, and expenses (including reasonable attorneys' fees) we incur arising from your use of the Service, the Content you submit, or your violation of these Terms, including any claim that your Content or use of the Service violates applicable law or the rights of any third party.

## Copyright Complaints

We take intellectual property rights seriously. Because the Service allows administrators to submit logo images, sponsor/advertisement assets, and links, we have adopted a policy of terminating, in appropriate circumstances and at our sole discretion, access to the Service for administrators who are deemed to be repeat infringers of others' intellectual property rights.

If you believe Content on the Service infringes your copyright, contact us at **divine-display@snake.mozmail.com** with a description of the copyrighted work, the material you believe infringes it, and your contact information. **[Consult legal counsel about whether a formal DMCA notice-and-takedown process, or an equivalent under your local copyright law, should be added here based on where you are located.]**

## Governing Law

The validity of these Terms and the rights, obligations, and relations of the parties under these Terms will be construed and determined under and in accordance with the laws of **Quebec**, without regard to conflicts of law principles.

## Jurisdiction

You expressly agree that exclusive jurisdiction for any dispute with the Service, or relating to your use of it, resides in the courts of **Quebec**, and you consent to the exercise of personal jurisdiction in the courts located in **Quebec** in connection with any such dispute. You further agree that you and we will not commence against the other a class action, class arbitration, or other representative action or proceeding.

## Termination

If you breach any of these Terms, we have the right to suspend or disable your access to or use of the Service, including deactivating your mosque administrator account and removing your configuration from public display.

You may terminate your own account at any time by requesting deletion — see [Data Retention](PRIVACY.md#data-retention) in the Privacy Policy.

## Entire Agreement

These Terms, together with the Privacy Policy and Ad Policy, constitute the entire agreement between you and **Divine Display** regarding your use of the Service, superseding any prior agreements between you and us relating to your use of the Service.

## Feedback

Please let us know what you think of the Service and these Terms. When you provide us with feedback, comments, or suggestions about the Service, you irrevocably assign to us all of your right, title, and interest in and to that feedback, so that we may use it to improve the Service without restriction.

## Questions & Contact Information

Questions or comments about the Service or these Terms may be directed to us at:

- **Email**: [divine-display@snake.mozmail.com](mailto:divine-display@snake.mozmail.com)
- **GitHub**: [As-Salam-Mosque/divine-display](https://github.com/As-Salam-Mosque/divine-display)
- **Report an issue**: [GitHub Issues](https://github.com/As-Salam-Mosque/divine-display/issues)
