<?php

namespace Colzak\UserBundle\Repository;

use Doctrine\ODM\MongoDB\DocumentRepository;

/**
 * UserRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class ProfileRepository extends DocumentRepository
{
    public function profileFilteredSearch($searchParams) {
    	$parameters = array();
    	foreach ($searchParams as $key => $value) {
            switch ($key) {
                case 'age':
                    $dates = $this->getAgeGroup($value);
                    $parameters['date1'] = $dates['d1'];
                    $parameters['date2'] = $dates['d2'];
                    break;
                default:
                    $parameters[$key] = $value;
                    break;
            }
        }

		//For instance I have to do geoNear(lat, lng) instead of geoNear(lng, lat) to have good distance calculation ? wtf ?
        // $portfolio = $this->getDocumentManager('ColzakPortfolioBundle:PortfolioInstrument');
        // $portfolio->createQueryBuilder()->eagerCursor(true);
        // $portfolio->field('level')->equals('PROFESSIONAL');
        // \Doctrine\Common\Util\Debug::dump($portfolio->getQuery()->execute());

        $profile = array();
        $q = $this->createQueryBuilder();
        $q->field('coordinates')->geoNear((float)$parameters['lat'], (float)$parameters['lng'])->spherical(true)->distanceMultiplier(6378.137)->maxDistance((isset($parameters['radius']) ? $parameters['radius'] : 20)/6371);
        if (array_key_exists('gender', $searchParams)) {
        	$q->field('gender')->equals($parameters['gender']);
		}
        if (array_key_exists('age', $searchParams)) {
            $dates = $this->getAgeGroup($searchParams['age']);
        	$q->field('birthdate')->lte($dates['d1']);
        	$q->field('birthdate')->gte($dates['d2']);
        }

        if (array_key_exists('category', $searchParams)) {
            $categories = explode(',', $searchParams['category']);
            $q->field('portfolio.portfolioInstruments.category')->in($categories);
        }

        if (array_key_exists('experience', $searchParams)) {
            $q->field('portfolio.portfolioInstruments.level')->equals(strtoupper($searchParams['experience']));
        }

        $q->limit(20);

        return $q->getQuery()->execute()->toArray(false);;
    }

    private function getAgeGroup($group) {
        $d1 = new \DateTime('NOW');
        $d2 = new \DateTime('NOW');
        $dates = array();

        if ($group == '18-25') {
            $d1->sub(new \DateInterval('P18Y'));
            $d2->sub(new \DateInterval('P25Y'));
        }
        if ($group == '25-35') {
            $d1->sub(new \DateInterval('P25Y'));
            $d2->sub(new \DateInterval('P35Y'));
        }
        if ($group == '35-50') {
            $d1->sub(new \DateInterval('P35Y'));
            $d2->sub(new \DateInterval('P50Y'));
        }
        if ($group == '50+') {
            $d1->sub(new \DateInterval('P50Y'));
            $d2->sub(new \DateInterval('P120Y'));
        }

        $dates['d1'] = $d1;//->format('Y-m-d');
        $dates['d2'] = $d2;//->format('Y-m-d');

        return $dates;
    }
}