export const metadata = {
  title: "Claritas — Sign up & start your trial",
  description: "Verify your medical licence and start your 14-day Claritas trial. Physician-only medical literature intelligence.",
};

import TopUtilityStrip from "@/components/TopUtilityStrip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupMain from "@/components/signup/SignupMain";

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen bg-paper overflow-x-hidden">
      <TopUtilityStrip />
      <Header />
      <SignupMain />
      <Footer />
    </div>
  );
}
