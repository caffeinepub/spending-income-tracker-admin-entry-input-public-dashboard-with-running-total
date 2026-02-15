import Map "mo:core/Map";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization Integration
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Income Entry Type
  type IncomeEntry = {
    date : Time.Time;
    icpAmount : Float;
    icpTokenValue : Float;
    incomeValue : Float;
  };

  module IncomeEntry {
    public func compareByDate(entry1 : IncomeEntry, entry2 : IncomeEntry) : Order.Order {
      Int.compare(entry1.date, entry2.date);
    };
  };

  let entries = Map.empty<Time.Time, IncomeEntry>();

  // Admin-only: Create income entry
  public shared ({ caller }) func createEntry(icpAmount : Float, icpTokenValue : Float) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let date = Time.now();
    let incomeValue = icpAmount * icpTokenValue;

    let newEntry : IncomeEntry = {
      date;
      icpAmount;
      icpTokenValue;
      incomeValue;
    };

    entries.add(date, newEntry);
  };

  // Public: List all entries
  public query func getEntries() : async [IncomeEntry] {
    entries.values().sort(IncomeEntry.compareByDate).toArray();
  };

  // Public: Get total income
  public query func getTotalIncome() : async Float {
    var totalIncome = 0.0;
    for (entry in entries.values()) {
      totalIncome += entry.incomeValue;
    };
    totalIncome;
  };
};
