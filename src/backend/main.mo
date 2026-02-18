import Map "mo:core/Map";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Person Type
  public type Person = {
    id : Nat;
    name : Text;
  };

  let persons = Map.empty<Nat, Person>();
  var nextPersonId = 1;

  // Income Entry Type (with timestamp)
  public type IncomeEntry = {
    date : Time.Time;
    personId : Nat;
    icpAmount : Float;
    icpTokenValue : Float;
    incomeValue : Float;
    timestamp : Time.Time;
  };

  module IncomeEntry {
    public func compareByDateDesc(entry1 : IncomeEntry, entry2 : IncomeEntry) : Order.Order {
      Int.compare(entry2.date, entry1.date);
    };
  };

  let entries = Map.empty<Time.Time, IncomeEntry>();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // AUTHORIZATION Integration
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function for automatic admin bootstrapping
  private func ensureInitialized(caller : Principal, adminToken : Text, userProvidedToken : Text) {
    // Initialize with first authenticated caller if no admin exists yet
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

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

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile, adminToken : Text, userProvidedToken : Text) : async () {
    ensureInitialized(caller, adminToken, userProvidedToken);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create Person (Admin Only)
  public shared ({ caller }) func createPerson(name : Text, adminToken : Text, userProvidedToken : Text) : async Nat {
    ensureInitialized(caller, adminToken, userProvidedToken);
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create persons");
    };

    let personId = nextPersonId;
    let newPerson : Person = {
      id = personId;
      name;
    };

    persons.add(personId, newPerson);
    nextPersonId += 1;
    personId;
  };

  // Get all persons (Public)
  public query func getPersons() : async [Person] {
    persons.values().toArray();
  };

  // Get person by ID (Public)
  public query func getPerson(personId : Nat) : async ?Person {
    persons.get(personId);
  };

  // Create Income Entry (Admin Only, with user-provided date)
  public shared ({ caller }) func createEntry(
    personId : Nat,
    icpAmount : Float,
    icpTokenValue : Float,
    date : Time.Time,
    adminToken : Text,
    userProvidedToken : Text,
  ) : async () {
    ensureInitialized(caller, adminToken, userProvidedToken);
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create entries");
    };

    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person not found") };
      case (?_person) {
        let incomeValue = icpAmount * icpTokenValue;
        let timestamp = Time.now();

        let newEntry : IncomeEntry = {
          date;
          personId;
          icpAmount;
          icpTokenValue;
          incomeValue;
          timestamp;
        };

        entries.add(timestamp, newEntry);
      };
    };
  };

  // Delete Income Entry (Admin Only)
  public shared ({ caller }) func deleteEntry(timestamp : Time.Time, adminToken : Text, userProvidedToken : Text) : async () {
    ensureInitialized(caller, adminToken, userProvidedToken);
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete entries");
    };

    if (entries.containsKey(timestamp)) {
      entries.remove(timestamp);
    } else {
      Runtime.trap("Entry not found");
    };
  };

  // Delete Person and Associated Entries (Admin Only)
  public shared ({ caller }) func deletePerson(personId : Nat, adminToken : Text, userProvidedToken : Text) : async () {
    ensureInitialized(caller, adminToken, userProvidedToken);
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete persons");
    };

    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person not found") };
      case (?_person) {
        // Remove associated entries
        let entriesToRemove = entries.filter(
          func(_timestamp, entry) {
            entry.personId == personId;
          }
        );

        if (entriesToRemove.size() > 0) {
          for ((timestamp, _) in entriesToRemove.entries()) {
            entries.remove(timestamp);
          };
        };
        persons.remove(personId);
      };
    };
  };

  // Get all income entries (Public)
  public query func getEntries() : async [IncomeEntry] {
    entries.values().toArray().sort(IncomeEntry.compareByDateDesc);
  };

  // Get entries by person ID (Public)
  public query func getEntriesByPerson(personId : Nat) : async [IncomeEntry] {
    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person not found") };
      case (?_person) {
        let filteredEntries = entries.values().filter(
          func(entry) {
            entry.personId == personId;
          }
        );
        filteredEntries.sort(IncomeEntry.compareByDateDesc).toArray();
      };
    };
  };

  // Get total income for all persons (Public)
  public query func getTotalIncome() : async Float {
    var totalIncome = 0.0;
    for (entry in entries.values()) {
      totalIncome += entry.incomeValue;
    };
    totalIncome;
  };

  // Get total income by person ID (Public)
  public query func getTotalIncomeByPerson(personId : Nat) : async Float {
    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person not found") };
      case (?_person) {
        var totalIncome = 0.0;
        for (entry in entries.values()) {
          if (entry.personId == personId) {
            totalIncome += entry.incomeValue;
          };
        };
        totalIncome;
      };
    };
  };

  // Get rolling 30-day income sum for a person
  public query func getRolling30DayIncomeSum(personId : Nat) : async Float {
    switch (persons.get(personId)) {
      case (null) { Runtime.trap("Person not found") };
      case (?_person) {
        let currentTime = Time.now();
        let daysInNanos : Int = 30 * 24 * 60 * 60 * 1_000_000_000;

        var rollingSum = 0.0;

        for ((_, entry) in entries.entries()) {
          if (
            entry.personId == personId and
            entry.date >= (currentTime - daysInNanos) and
            entry.date <= currentTime
          ) {
            rollingSum += entry.incomeValue;
          };
        };

        rollingSum;
      };
    };
  };
};

