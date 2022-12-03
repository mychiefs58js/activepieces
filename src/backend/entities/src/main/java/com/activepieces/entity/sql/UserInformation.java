package com.activepieces.entity.sql;

import com.activepieces.common.EntityMetadata;
import com.activepieces.entity.enums.UserStatus;
import com.github.ksuid.Ksuid;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_information", indexes = @Index(columnList = "email"))
public class UserInformation implements EntityMetadata {

  @Id
  @Column
  private Ksuid id;

  @Column(name = "email", unique = true)
  private String email;

  @Column(name = "full_name")
  private String firstName;

  @Column(name = "last_name")
  private String lastName;

  @Column(name = "password")
  private String password;

  @Column(name = "user_status", nullable = false)
  private UserStatus status;

  @Column(name = "creation_time", nullable = false)
  private long epochCreationTime;

  @Column(name = "update_time", nullable = false)
  private long epochUpdateTime;

}
