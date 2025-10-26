export interface IFullOAGFlight {
    carrier: {
        iata: string;
        icao: string;
    };
    serviceSuffix: string;
    flightNumber: number;
    sequenceNumber: number;
    flightType: string;
    departure: {
        airport: {
            iata: string;
            icao: string;
            faa: string;
        };
        terminal: string;
        country: {
            code: string;
        };
        date: {
            local: string;
            utc: string;
        };
        time: {
            local: string;
            utc: string;
        };
    };
    arrival: {
        airport: {
            iata: string;
            icao: string;
            faa: string;
        };
        terminal: string;
        country: {
            code: string;
        };
        date: {
            local: string;
            utc: string;
        };
        time: {
            local: string;
            utc: string;
        };
    };
    elapsedTime: number;
    cargoTonnage: number;
    aircraftType: {
        iata: string;
        icao: string;
    };
    serviceType: {
        iata: string;
    };
    segmentInfo: {
        numberOfStops: number;
        intermediateAirports: {
            iata: {
                sequenceNumber: number;
                station: string;
            }[];
        };
    };
    distance: {
        accumulatedGreatCircleKilometers: number;
        accumulatedGreatCircleMiles: number;
        accumulatedGreatCircleNauticalMiles: number;
        greatCircleKilometers: number;
        greatCircleMiles: number;
        greatCircleNauticalMiles: number;
    };
    codeshare: {
        operatingAirlineDisclosure: {
            code: string;
            name: string;
            number: string;
        };
        aircraftOwner: {
            code: string;
            name: string;
        };
        cockpitCrewEmployer: {
            code: string;
            name: string;
            number: string;
        };
        jointOperationAirlineDesignators: {
            code: string;
            name: string;
            number: string;
        }[];
        marketingFlights: {
            code: string;
            serviceNumber: string;
            suffix: string;
        }[];
        operatingFlight: {
            code: string;
            serviceNumber: string;
            suffix: string;
        };
    };
    scheduleInstanceKey: string;
    statusKey: string;
    originalFlight: string;
    map: string;
    bookingClasses: {
        code: string;
        meal: string;
    }[];
    freightClasses: {
        code: string;
        quantity: string;
    }[];
    restrictions: {
        number: number;
        code: string;
        passenger: boolean;
        cargo: boolean;
        mail: boolean;
        boardPoint: boolean;
        offPoint: boolean;
    }[];
    planeChangeWithoutAircraftChange: boolean;
    onTimePerformance: {
        indicator: {
            month: string;
            value: string;
        };
        delaysAndCancellationsIndicator: {
            month: string;
            min15: string;
            min30: string;
            min30Warning: string;
            cancel: string;
        };
    };
    inFlightServices: string[];
    automatedCheckIn: boolean;
    electronicTicketing: boolean;
    secureFlightIndicator: boolean;
    governmentApproval: boolean;
    statusDetails: {
        state: string;
        updatedAt: string;
        equipment: {
            aircraftRegistrationNumber: string;
            actualAircraftType: {
                iata: string;
                icao: string;
            };
        };
        departure: {
            estimatedTime: {
                outGateTimeliness: string;
                outGateVariation: string;
                outGate: {
                    local: string;
                    utc: string;
                };
                offGround: {
                    local: string;
                    utc: string;
                };
            };
            actualTime: {
                outGateTimeliness: string;
                outGateVariation: string;
                outGate: {
                    local: string;
                    utc: string;
                };
                offGround: {
                    local: string;
                    utc: string;
                };
            };
            airport: {
                iata: string;
                icao: string;
                faa: string;
            };
            actualTerminal: string;
            gate: string;
            checkInCounter: string;
            country: {
                code: string;
            };
        };
        arrival: {
            estimatedTime: {
                inGateTimeliness: string;
                inGateVariation: string;
                onGround: {
                    local: string;
                    utc: string;
                };
                inGate: {
                    local: string;
                    utc: string;
                };
            };
            actualTime: {
                inGateTimeliness: string;
                inGateVariation: string;
                onGround: {
                    local: string;
                    utc: string;
                };
                inGate: {
                    local: string;
                    utc: string;
                };
            };
            airport: {
                iata: string;
                icao: string;
                faa: string;
            };
            actualTerminal: string;
            gate: string;
            baggage: string;
            country: {
                code: string;
            };
        };
        diversionAirport: {
            iata: string;
            icao: string;
            faa: string;
        };
        irregularOperationType: string;
        diversionType: string;
    }[];
    seatingCapacity: {
        actual: {
            firstClass: number;
            businessClass: number;
            premiumEconomyClass: number;
            economyPlusClass: number;
            economyClass: number;
            totalSeats: number;
        };
        predicted: {
            firstClass: number;
            businessClass: number;
            premiumEconomyClass: number;
            economyPlusClass: number;
            economyClass: number;
            totalSeats: number;
        };
    };
}
