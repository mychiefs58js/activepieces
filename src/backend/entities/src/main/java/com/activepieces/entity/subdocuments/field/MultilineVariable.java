package com.activepieces.entity.subdocuments.field;

import com.activepieces.entity.enums.VariableSource;
import com.activepieces.entity.subdocuments.field.settings.NormalSettings;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import javax.validation.constraints.NotNull;
import java.util.Objects;

@SuperBuilder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MultilineVariable extends Variable<NormalSettings>  {

    @JsonProperty
    @NotNull
    private NormalSettings settings;

    private Object value;

    public boolean validate(Object finalValue) {
        if(getSource().equals(VariableSource.PREDEFINED)){
            return Objects.nonNull(finalValue) && finalValue instanceof String && ((String) finalValue).length() > 0;
        }
        return (Objects.nonNull(finalValue) && finalValue instanceof String && ((String) finalValue).length() > 0)
                || !settings.isRequired();
    }
}
