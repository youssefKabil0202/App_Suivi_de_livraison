package com.campusdelivery.dto.response;

import com.campusdelivery.entity.Address;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private Integer id;
    private String label;
    private String addressLine;
    private Double latitude;
    private Double longitude;
    private Boolean isFrequent;
    private Integer userId;
    private String userName;

    public static AddressResponse fromEntity(Address address) {
        if (address == null) return null;
        return AddressResponse.builder()
                .id(address.getId())
                .label(address.getLabel())
                .addressLine(address.getAddressLine())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isFrequent(address.getIsFrequent())
                .userId(address.getUser() != null ? address.getUser().getId() : null)
                .userName(address.getUser() != null ? address.getUser().getName() : null)
                .build();
    }
}
