package org.endeavourhealth.patientexplorer.database;

import com.fasterxml.jackson.databind.JsonNode;
import org.endeavourhealth.common.cache.ObjectMapperPool;
import org.endeavourhealth.common.config.ConfigManager;
import org.endeavourhealth.patientexplorer.database.models.ConceptEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;
import javax.persistence.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public enum EkbPostgresProvider implements EkbProvider {
	INSTANCE;
	private static final Logger LOG = LoggerFactory.getLogger(EkbPostgresProvider.class);
	private EntityManagerFactory emFactory;

	public List<ConceptEntity> search(String term, int maxResultsSize, int start) {
		EntityManager entityManager = getEntityManager();

		String sql = "select c" +
				" from " +
				"    ConceptEntity c" +
				" where" +
				"    upper(c.display) like :term " +
				" order by " +
				"    length(c.display) ";

		term = term.toUpperCase();

		Query query = entityManager.createQuery(sql, ConceptEntity.class)
				.setParameter("term", "%" + term + "%")
				.setFirstResult(start * maxResultsSize)
				.setMaxResults(maxResultsSize);

		List<ConceptEntity> ret = query.getResultList();

		entityManager.close();

		return ret;
	}

	public ConceptEntity getConcept(String code) {
		EntityManager entityManager = getEntityManager();

		String sql = "select c" +
				" from " +
				"    ConceptEntity c" +
				" where" +
				"    c.code = :code ";

		Query query = entityManager.createQuery(sql, ConceptEntity.class)
				.setParameter("code", code);

		List<ConceptEntity> ret = query.getResultList();

		entityManager.close();

		if (ret.size() > 0)
			return ret.get(0);
		else
			return null;
	}

	public List<ConceptEntity> getChildren(String code) {
		EntityManager entityManager = getEntityManager();

		String sql = "select r" +
				" from ConceptEntity c" +
				" join ConceptPcLinkEntity l on l.parent_pid = c.pid " +
				" join ConceptEntity r on r.pid = l.child_pid " +
				" where" +
				"    c.code = :code ";

		Query query = entityManager.createQuery(sql, ConceptEntity.class)
				.setParameter("code", code);

		List<ConceptEntity> ret = query.getResultList();

		entityManager.close();

		return ret;
	}

	public List<ConceptEntity> getParents(String code) {
		EntityManager entityManager = getEntityManager();

		String sql = "select r" +
				" from ConceptEntity c" +
				" join ConceptPcLinkEntity l on l.child_pid = c.pid " +
				" join ConceptEntity r on r.pid = l.parent_pid " +
				" where" +
				"    c.code = :code ";

		Query query = entityManager.createQuery(sql, ConceptEntity.class)
				.setParameter("code", code);

		List<ConceptEntity> ret = query.getResultList();

		entityManager.close();

		return ret;
	}

	public void close() {
		getEmFactory().close();
	}

	private EntityManager getEntityManager() {
		return getEmFactory().createEntityManager();
	}

	private synchronized EntityManagerFactory getEmFactory() {
		if (emFactory == null) {
			try {
				String codingDbJson = ConfigManager.getConfiguration("coding");
				JsonNode codingDb = ObjectMapperPool.getInstance().readTree(codingDbJson);

				Map<String, Object> override = new HashMap<>();

				if (codingDb.has("url"))
					override.put("hibernate.hikari.dataSource.url", codingDb.get("url").asText());
				if (codingDb.has("username"))
					override.put("hibernate.hikari.dataSource.user", codingDb.get("username").asText());
				if (codingDb.has("password"))
					override.put("hibernate.hikari.dataSource.password", codingDb.get("password").asText());

				emFactory = Persistence.createEntityManagerFactory("coding", override);
			} catch (Exception e) {
				LOG.error("Error initializing persistence manager", e);
			}
		}

		return emFactory;
	}
}
