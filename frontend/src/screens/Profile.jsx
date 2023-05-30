import React from "react";
import CustomNavbar from "../components/CustomNavbar";
import Footer from "../components/Footer";
import ProfileCard from "../components/ProfileCard";

const ProfileForm = () => {
  return (
    <div>
      <div>
        <CustomNavbar />
        <div className="container min-vh-100">
          <ProfileCard />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ProfileForm;
