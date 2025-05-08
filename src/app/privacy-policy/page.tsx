/* eslint-disable react/no-unescaped-entities */

import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicyPage() {
  return (
    <ScrollArea className="h-full overflow-scroll">
      <div className="p-6 md:p-12 max-w-4xl mx-auto text-sm text-gray-800 space-y-6 ">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>

        <p>
          This privacy notice for Brett Inc. (&quot;Company&quot;,
          &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), describes how and
          why we might collect, store, use, and/or share (&quot;process&quot;)
          your information when you use our services (&quot;Services&quot;),
          such as when you:
        </p>

        <div className="pl-4 list-disc">
          <div>
            Visit our website at brett.so or any website of ours that links to
            this privacy notice
          </div>
          <div>
            Engage with us in other related ways, including any sales,
            marketing, or events
          </div>
        </div>

        <p>
          Questions or concerns? Reading this privacy notice will help you
          understand your privacy rights and choices. If you do not agree with
          our policies and practices, please do not use our Services. If you
          still have any questions or concerns, please contact us at
          hello@brett.so.
        </p>

        <h2 className="text-lg font-medium mt-8">SUMMARY OF KEY POINTS</h2>

        <p>
          This summary provides key points from our privacy notice. You can find
          out more details about any of these topics by using our table of
          contents below to find the section you are looking for.
        </p>

        <h3 className="text-md font-semibold mt-6">
          What personal information do we process?
        </h3>
        <p>
          When you visit, use, or navigate our Services, we may process personal
          information depending on how you interact with Brett Inc. and the
          Services, the choices you make, and the products and features you use.
        </p>

        <h3 className="text-md font-semibold mt-6">
          Do we process any sensitive personal information?
        </h3>
        <p>We do not process sensitive personal information.</p>

        <h3 className="text-md font-semibold mt-6">
          Do we receive any information from third parties?
        </h3>
        <p>We do not receive any information from third parties.</p>

        <h3 className="text-md font-semibold mt-6">
          How do we process your information?
        </h3>
        <p>
          We process your information to provide, improve, and administer our
          Services, communicate with you, for security and fraud prevention, and
          to comply with law. We may also process your information for other
          purposes with your consent.
        </p>

        <h3 className="text-md font-semibold mt-6">
          In what situations and with which types of parties do we share
          personal information?
        </h3>
        <p>
          We may share information in specific situations and with specific
          categories of third parties.
        </p>

        <h3 className="text-md font-semibold mt-6">What are your rights?</h3>
        <p>
          Depending on where you are located geographically, the applicable
          privacy law may mean you have certain rights regarding your personal
          information.
        </p>

        <p>
          Want to learn more about what Brett Inc. does with any information we
          collect? Review the privacy notice in full.
        </p>
      </div>
    </ScrollArea>
  );
}
