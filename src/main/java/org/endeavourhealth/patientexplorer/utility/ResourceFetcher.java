package org.endeavourhealth.patientexplorer.utility;

import org.endeavourhealth.common.cache.ParserPool;
import org.endeavourhealth.core.database.dal.DalProvider;
import org.endeavourhealth.core.database.dal.ehr.ResourceDalI;
import org.endeavourhealth.core.database.dal.ehr.models.ResourceWrapper;

import java.util.*;
import java.util.stream.Collectors;

public class ResourceFetcher {
    public static final ParserPool PARSER_POOL = new ParserPool();

    private static final ResourceDalI resourceRepository = DalProvider.factoryResourceDal();

    public static <T> List<T> getResourceByPatient(UUID serviceId, UUID systemId, UUID patientId, Class<T> resourceType) throws Exception {
        List<ResourceWrapper> resourceByPatientList = resourceRepository.getResourcesByPatient(serviceId, systemId, patientId, resourceType.getSimpleName());

        List<String> resources = resourceByPatientList
                .stream()
                .map(t -> t.getResourceData())
                .collect(Collectors.toList());

        return parse(resources, resourceType);
    }

    public static <T> T getSingleResourceByPatient(UUID serviceId, UUID systemId, UUID patientId, Class<T> resourceType) throws Exception {
        List<T> resources = getResourceByPatient(serviceId, systemId, patientId, resourceType);

        return ensureSingleResource(resources, resourceType);
    }

    public static <T> List<T> getResourcesByService(UUID serviceId, UUID systemId, List<UUID> resourceIds, Class<T> resourceType) throws Exception {
        if (resourceIds == null || resourceIds.size() == 0)
            return new ArrayList<>();

        List<ResourceWrapper> resourceByServiceList = resourceRepository.getResourcesByService(serviceId, systemId, resourceType.getSimpleName(), resourceIds);

        List<String> resources = resourceByServiceList
                .stream()
                .map(t -> t.getResourceData())
                .collect(Collectors.toList());

        return parse(resources, resourceType);
    }

    public static <T> T getSingleResourceByService(UUID serviceId, UUID systemId, UUID resourceId, Class<T> resourceType) throws Exception {
        List<T> resources = getResourcesByService(serviceId, systemId, Collections.singletonList(resourceId), resourceType);

        return ensureSingleResource(resources, resourceType);
    }

    private static <T> T ensureSingleResource(List<T> resources, Class<T> resourceType) throws Exception {
        if ((resources == null) || (resources.size() == 0))
            throw new Exception(resourceType.getSimpleName() + " resource not found");

        if (resources.size() > 1)
            throw new Exception("Multiple " + resourceType.getSimpleName() + " resources found");

        return resources.get(0);
    }

    private static <T> List<T> parse(List<String> resources, Class<T> resourceType) throws Exception {
        List<T> result = new ArrayList<>();

        for (String resource : resources)
            result.add((T)PARSER_POOL.parse(resource));

        return result;
    }
}
