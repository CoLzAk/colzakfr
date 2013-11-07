<?php
// src/Colzak/UserBundle/Document/Portfolio.php

namespace Colzak\UserBundle\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;
use JMS\Serializer\Annotation as SERIAL;

/**
 * @MongoDB\Document()
 */
class Portfolio
{
    /**
     * @MongoDB\Id(strategy="auto")
     * @SERIAL\Type("integer")
     */
    protected $id;

    /**
     * @MongoDB\ReferenceMany(targetDocument="Colzak\MusicBundle\Document\Instrument")
     * @SERIAL\Type("Colzak\MusicBundle\Document\Instrument")
     */
    protected $instruments;

    /**
     * @MongoDB\String
     * @SERIAL\Type("string")
     */
    protected $targetsDescription;

    /**
     * @MongoDB\ReferenceMany(targetDocument="Colzak\MusicBundle\Document\Instrument")
     * @SERIAL\Type("Colzak\MusicBundle\Document\Instrument")
     */
    protected $targets;

    /**
     * @MongoDB\ReferenceMany(targetDocument="Colzak\UserBundle\Document\Objective")
     * @SERIAL\Type("Colzak\UserBundle\Document\Objective")
     */
    protected $objectives;
    
    public function __construct()
    {
        $this->instruments = new \Doctrine\Common\Collections\ArrayCollection();
        $this->targets = new \Doctrine\Common\Collections\ArrayCollection();
        $this->objectives = new \Doctrine\Common\Collections\ArrayCollection();
    }
    
    /**
     * Get id
     *
     * @return id $id
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Add instrument
     *
     * @param Colzak\MusicBundle\Document\Instrument $instrument
     */
    public function addInstrument(\Colzak\MusicBundle\Document\Instrument $instrument)
    {
        $this->instruments[] = $instrument;
    }

    /**
     * Remove instrument
     *
     * @param Colzak\MusicBundle\Document\Instrument $instrument
     */
    public function removeInstrument(\Colzak\MusicBundle\Document\Instrument $instrument)
    {
        $this->instruments->removeElement($instrument);
    }

    /**
     * Get instruments
     *
     * @return Doctrine\Common\Collections\Collection $instruments
     */
    public function getInstruments()
    {
        return $this->instruments;
    }

    /**
     * Set targetsDescription
     *
     * @param string $targetsDescription
     * @return self
     */
    public function setTargetsDescription($targetsDescription)
    {
        $this->targetsDescription = $targetsDescription;
        return $this;
    }

    /**
     * Get targetsDescription
     *
     * @return string $targetsDescription
     */
    public function getTargetsDescription()
    {
        return $this->targetsDescription;
    }

    /**
     * Add target
     *
     * @param Colzak\MusicBundle\Document\Instrument $target
     */
    public function addTarget(\Colzak\MusicBundle\Document\Instrument $target)
    {
        $this->targets[] = $target;
    }

    /**
     * Remove target
     *
     * @param Colzak\MusicBundle\Document\Instrument $target
     */
    public function removeTarget(\Colzak\MusicBundle\Document\Instrument $target)
    {
        $this->targets->removeElement($target);
    }

    /**
     * Get targets
     *
     * @return Doctrine\Common\Collections\Collection $targets
     */
    public function getTargets()
    {
        return $this->targets;
    }

    /**
     * Add objective
     *
     * @param Colzak\UserBundle\Document\Objective $objective
     */
    public function addObjective(\Colzak\UserBundle\Document\Objective $objective)
    {
        $this->objectives[] = $objective;
    }

    /**
     * Remove objective
     *
     * @param Colzak\UserBundle\Document\Objective $objective
     */
    public function removeObjective(\Colzak\UserBundle\Document\Objective $objective)
    {
        $this->objectives->removeElement($objective);
    }

    /**
     * Get objectives
     *
     * @return Doctrine\Common\Collections\Collection $objectives
     */
    public function getObjectives()
    {
        return $this->objectives;
    }
}
