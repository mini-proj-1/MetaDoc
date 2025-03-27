// contracts/PatientHistory.sol
pragma solidity ^0.8.0;

contract PatientHistory {
    struct Record {
        string visitDate;
        string symptoms;
        string diagnosis;
        string prescription;
    }
    
    mapping(address => Record[]) private patientRecords;
    address private admin;
    mapping(address => bool) private authorizedProviders;

    // Events
    event RecordAdded(address indexed patient, uint timestamp);
    event ProviderAuthorized(address indexed provider);
    event ProviderRevoked(address indexed provider);

    constructor() {
        admin = msg.sender;
        authorizedProviders[admin] = true; // Admin is automatically an authorized provider
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Unauthorized: Only admin can perform this action");
        _;
    }

    modifier onlyAuthorized() {
        require(msg.sender == admin || authorizedProviders[msg.sender], "Unauthorized: Only admin or authorized providers can perform this action");
        _;
    }

    // Patient can add their own record
    function addRecord(
        string memory visitDate,
        string memory symptoms,
        string memory diagnosis,
        string memory prescription
    ) public {
        patientRecords[msg.sender].push(Record(
            visitDate,
            symptoms,
            diagnosis,
            prescription
        ));
        emit RecordAdded(msg.sender, block.timestamp);
    }

    // Authorized provider can add a record for a patient
    function addRecordForPatient(
        address patient,
        string memory visitDate,
        string memory symptoms,
        string memory diagnosis,
        string memory prescription
    ) public onlyAuthorized {
        patientRecords[patient].push(Record(
            visitDate,
            symptoms,
            diagnosis,
            prescription
        ));
        emit RecordAdded(patient, block.timestamp);
    }

    // Get your own records
    function getRecords() public view returns (Record[] memory) {
        return patientRecords[msg.sender];
    }

    // Admin or authorized provider can access patient records
    function getPatientRecords(address patient) public view onlyAuthorized returns (Record[] memory) {
        return patientRecords[patient];
    }

    // Admin functions to manage authorized providers
    function authorizeProvider(address provider) public onlyAdmin {
        authorizedProviders[provider] = true;
        emit ProviderAuthorized(provider);
    }

    function revokeProvider(address provider) public onlyAdmin {
        require(provider != admin, "Cannot revoke admin's authorization");
        authorizedProviders[provider] = false;
        emit ProviderRevoked(provider);
    }

    function isAuthorizedProvider(address provider) public view returns (bool) {
        return authorizedProviders[provider];
    }
} 